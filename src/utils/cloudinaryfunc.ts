import { ApiError } from "./apiErrorUtils"
import cloudinary from "../config/cloudinary"
import fs from "fs-extra";



export const cloudinaryUploads=async(filePath:string)=>{

    try{
        if(!filePath){
            throw new ApiError(400, "filePath not found !")
        }

        const uploadResponse= await cloudinary.uploader.upload(filePath,{
            resource_type:"auto"
        });

        return uploadResponse;


    }catch{
        fs.unlinkSync(filePath); //remove the locally saved temporary file  since uploader function got failed!!
        throw new ApiError(400, "uploading to cloudinary failed !")
    }

}



export const cloudinaryDelete=async(publicId:string)=>{
    
    const deleteting= await cloudinary.uploader.destroy(publicId, (err, result) => {
        console.log({ err, result });
        throw new ApiError(500,"Unable to delete images !");
      });

    return deleteting;

}