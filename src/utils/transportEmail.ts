import { transporter } from "../config/emailTransfer";
import type { SendMailOptions } from "nodemailer";

export const doMail=(mailOptions:SendMailOptions)=>{
    transporter.sendMail(mailOptions, (err,info)=>{
        if(err){
            console.log("Error sending mail !! ")
            console.error("Error sending mail: ",err)
        }else{
            console.log("Email sent: ",info.response);
        }
    })
    
}


