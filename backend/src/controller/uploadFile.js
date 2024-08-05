import { SuccessResponse, ErrorResponse } from "../utils/response.js";
import * as Minio from 'minio';

const uploadFile = async (req, res) => {

    const file = req.file;
    const requestName = req.params.request;

    try {
        let uploadResult = null;
        if (file !== undefined) {
            const bucketName = requestName;
            // Ensure `uploadFileToMinio` returns relevant data
            uploadResult = await uploadFileToMinio(req, res, bucketName);
        }

        // Check if the upload was successful
        if (uploadResult) {
            return SuccessResponse(res, 200, 'Success upload file', uploadResult);
        } else {
            return SuccessResponse(res, 200, 'The data has been updated, but no file was uploaded', null);
        }
    } catch (error) {
        console.error('Error in uploadFile:', error);
        return ErrorResponse(res, 404, 'Error updating upload file');
    }
}

const uploadFileToMinio = async (req, res, bucketName) => {
    const minioClient = new Minio.Client({
        endPoint: process.env.MINIO_ENDPOINT,
        port: parseInt(process.env.MINIO_PORT, 10),
        useSSL: process.env.MINIO_USE_SSL === 'true',
        accessKey: process.env.MINIO_ACCESS_KEY,
        secretKey: process.env.MINIO_SECRET_KEY,
    });

    const sourceFile = req.file;
    const bucket = bucketName;

    const destinationObject = sourceFile.originalname;

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

const uploadFileController = {
    uploadFile,
}

export default uploadFileController;