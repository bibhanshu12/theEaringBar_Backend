import { v2 as cloudinary} from "cloudinary"


export const cloudinaryDestroy=async(publicId:string)=>{
    return cloudinary.uploader.destroy(publicId);
}

