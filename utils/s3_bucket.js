require("dotenv").config();
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
    region: process.env.BUCKET_REGION, // Replace with your AWS region
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Replace with your access key ID
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY // Replace with your secret access key
    }
});

module.exports = {
    uploadFile: async (data) => {
        try {
            let { newPath, fileContent, profile_picture_type } = data;

            const params = {
                Bucket: process.env.BUCKET_NAME,
                Key: `${newPath}`,
                Body: fileContent,
                ContentType: `${profile_picture_type}`,
                ACL: 'private'
            };

            const command = new PutObjectCommand(params);

            const imagedata = await s3Client.send(command);

            console.log({ imagedata });

            const fileUrl = process.env.S3_BUCKET_URL + params.Key;

            return ({
                success: true,
                message: "Image uploaded successfully",
                fileUrl,
            });

        } catch (error) {
            console.log("Error uploading data: ", error);
            return ({
                success: false,
                message: "Error in uploading image",
            })
        }
    },

    deleteFile: async (data) => {
        try {
            let { filePath } = data;

            const params = {
                Bucket: process.env.BUCKET_NAME,
                Key: filePath
            };

            console.log({params});
            

            // Create a DeleteObjectCommand
            const command = new DeleteObjectCommand(params);

            // Send the command to S3 to delete the object
            const deleteFile = await s3Client.send(command);

            return ({
                success: true,
                message: "Image deleted successfully",
                filePath,
            })

        } catch (error) {
            console.log("Error deleting data: ", error);
            return ({
                success: false,
                message: "Error in deleting image",
            })
        }
    }
}