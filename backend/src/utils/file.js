import { SuccessResponse, ErrorResponse } from "./response.js";
import * as Minio from 'minio';
import { userPermission } from "../middleware/jwtAuth.js";
import path from 'path';
import { S3Client, ListObjectVersionsCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const uploadFile = async (req, res) => {

    const file = req.file;
    const fileExtension = path.extname(file.originalname);
    const requestName = req.params.request;
    const permission = await userPermission(req)
    const minioFileName = `${requestName}-${permission.id}-${permission.username}${fileExtension}`

    try {
        let uploadResult = null;
        if (file !== undefined) {
            const bucketName = requestName;
            // Ensure `uploadFileToMinio` returns relevant data
            uploadResult = await uploadFileToMinio(req, res, bucketName, minioFileName);
        }

        const data = {
            "bucket_name": requestName,
            "original_name_file": file.originalname,
            "file_minio_name": minioFileName,
        }

        // Check if the upload was successful
        if (uploadResult) {
            return SuccessResponse(res, 200, 'Success upload file', data);
        } else {
            return SuccessResponse(res, 200, 'The data has been updated, but no file was uploaded', null);
        }
    } catch (error) {
        console.error('Error in uploadFile:', error);
        return ErrorResponse(res, 404, 'Error updating upload file');
    }
}

const uploadFileToMinio = async (req, res, bucketName, minioFileName) => {
    const minioClient = new Minio.Client({
        endPoint: process.env.MINIO_ENDPOINT,
        port: parseInt(process.env.MINIO_PORT, 10),
        useSSL: process.env.MINIO_USE_SSL === 'true',
        accessKey: process.env.MINIO_ACCESS_KEY,
        secretKey: process.env.MINIO_SECRET_KEY,
    });

    const sourceFile = req.file;
    const bucket = bucketName;

    const destinationObject = minioFileName;

    try {
        // Check if the bucket exists
        const exists = await minioClient.bucketExists(bucket);
        if (!exists) {
            await minioClient.makeBucket(bucket, 'us-east-1');
            console.log('Bucket ' + bucket + ' created in "us-east-1".');
            await minioClient.setBucketVersioning(bucket, { Status: 'Enabled' });
            console.log('Versioning enabled for bucket ' + bucket);
        } else {
            console.log('Bucket ' + bucket + ' exists.');
        }

        const metaData = {
            'Content-Type': sourceFile.mimetype,
            'X-Amz-Meta-Original-Name': sourceFile.originalname,
            'X-Amz-Meta-Size': sourceFile.size.toString(),
        };

        await minioClient.putObject(bucket, destinationObject, sourceFile.buffer, sourceFile.size, metaData);
    } catch (error) {
        console.error('Error uploading file to minio:', error);
        return ErrorResponse(res, 404, 'Error uploading file to minio', error);
    }

    const fileUrl = `${process.env.MINIO_ENDPOINT}/${bucket}/${destinationObject}`;
    return fileUrl;

}

const initializeS3Client = async () => {
    return new S3Client({
        region: process.env.MINIO_REGION,
        endpoint: process.env.MINIO_ENDPOINT_S3,
        credentials: {
            accessKeyId: process.env.MINIO_ACCESS_KEY,
            secretAccessKey: process.env.MINIO_SECRET_KEY,
        },
        forcePathStyle: true,
    });
};

const listObjectVersions = async (bucketName, fileName) => {
    const command = new ListObjectVersionsCommand({
        Bucket: bucketName,
        Prefix: fileName,
    });

    const s3 = await initializeS3Client();

    try {
        const data = await s3.send(command);
        return data.Versions;
    } catch (err) {
        console.error('Error listing object versions:', err);
        throw err;
    }
};

const getUrlPreviewFile = async (req, res, bucketName, fileMinioName) => {
    const s3 = await initializeS3Client();
    const fileVersions = await uploadFileController.listObjectVersions(bucketName, fileMinioName);

    const latestVersion = fileVersions && fileVersions.length > 0 ? fileVersions[0].VersionId : null;

    const getObjectCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: fileMinioName,
        VersionId: latestVersion,
    });

    try {
        const url = await getSignedUrl(s3, getObjectCommand, { expiresIn: 3600 });
        return url;
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        throw error;
    }
};

const getUrlDownloadFile = async (bucketName, fileName) => {
    const s3 = await initializeS3Client();
    const fileVersions = await uploadFileController.listObjectVersions(bucketName, fileName);

    const latestVersion = fileVersions && fileVersions.length > 0 ? fileVersions[0].VersionId : null;

    const getObjectCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        VersionId: latestVersion,
        ResponseContentDisposition: `attachment; filename="${fileName}"`  
    });

    try {
        const url = await getSignedUrl(s3, getObjectCommand, { expiresIn: 3600 });
        return url;
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        throw error;
    }
};

const uploadFileController = {
    uploadFile,
    uploadFileToMinio,
    initializeS3Client,
    listObjectVersions,
    getUrlPreviewFile,
    getUrlDownloadFile,
}

export default uploadFileController;