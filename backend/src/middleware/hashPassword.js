import crypto from 'crypto';

const hashPassword = async (password, salt = process.env.PBDKF2_ENCRYPT, iterations = parseInt(process.env.PBKDF2_ITERATIONS), keylen = parseInt(process.env.PBKDF2_KEYLEN), digest = process.env.PBKDF2_DIGEST) => {
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(password, salt, iterations, keylen, digest, (err, derivedKey) => {
            if (err) reject(err);
            resolve(derivedKey.toString('hex'));
        });
    });
};

const verifyPassword = async (password, hashedPassword, salt = process.env.PBDKF2_ENCRYPT, iterations = parseInt(process.env.PBKDF2_ITERATIONS), keylen = parseInt(process.env.PBKDF2_KEYLEN), digest = process.env.PBKDF2_DIGEST) => {
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(password, salt, iterations, keylen, digest, (err, derivedKey) => {
            if (err) reject(err);
            resolve(derivedKey.toString('hex') === hashedPassword);
        });
    });
};

export {hashPassword, verifyPassword}