require('dotenv').config()
const fs = require('fs')
const S3 = require('aws-sdk/clients/s3')

const bucketName = process.env.AWS_BUCKET_NAME
const region     = process.env.AWS_BUCKET_REGION
const accessKey  = process.env.AWS_ACCESS_KEY
const secretKey  = process.env.AWS_SECRET_KEY

const s3 = new S3({
    credentials: {
        accessKeyId : accessKey,
        secretAccessKey: secretKey
    },
    region: region
})

function uploadImage(file) {
    const fileStream = fs.createReadStream(file.path)

    const uploadParams = {
        Bucket: bucketName, Body: fileStream, Key: 'file.jpg'
    }

    return s3.upload(uploadParams).promise()
}

exports.uploadImage = uploadImage