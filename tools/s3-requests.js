require('dotenv').config()
const fs = require('fs')
const util = require('util')
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
        Bucket: bucketName, Body: fileStream, Key: file.filename
    }

    return s3.upload(uploadParams).promise()
}

// TODO: take 2 arrays (image & text);
// save images to s3 bucket
// save image file names as objects

// if (find image) => 
// push image to s3
// outputArray.append({'image' , filename , caption})
// if(find text) => outputArray.append({'text' , element.text})

async function savePostArray(textArray , imageArray , captionArray , unlinkFile) {
    let textIndex    = 0
    let imageIndex   = 0
    const outputArray = [] 

    while(textIndex <= imageArray.length && textArray) {
        if(textArray[textIndex] === '$image$') { // found image
            await uploadImage(imageArray[imageIndex])
            outputArray.push(
                [ 'image' , imageArray[imageIndex].filename , 
                (Array.isArray(captionArray) ? captionArray[imageIndex] : captionArray) ] )
            await unlinkFile(imageArray[imageIndex].path)
            imageIndex++
        } else { // found text
            outputArray.push( ['text' , textArray[textIndex] , ''] )
        }
        textIndex++
    }

    return outputArray
}

exports.uploadImage = uploadImage
exports.savePostArray = savePostArray
