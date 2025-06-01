

export const signupMail = (toEmail:string)=>{
   return {
    from: "theearingbar@gmail.com",
    to:toEmail,
    subject: "Welcome to EaringBar!",
    text: "Thanks for to be part of Us!.", // Fallback for email clients that don't support HTML
    html: `
     <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="background-color: #4CAF50; color: white; padding: 20px 30px;">
          <h1 style="margin: 0;">Welcome to Broodaar!</h1>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px;">Hi there 👋,</p>
          <p style="font-size: 15px; line-height: 1.6;">
            We're excited to have you onboard. You've successfully signed up for <strong>EaringBar</strong>, your go-to platform for premium jewelry and custom designs.
          </p>
          <p style="font-size: 15px; line-height: 1.6;">
            To get started, simply visit our site and browse the latest collections. If you have any questions, feel free to reply to this email.
          </p>
          <div style="margin-top: 20px; text-align: center;">
            <a href="https://bibhanshu.tech" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Visit EaringBar
            </a>
          </div>
          <p style="margin-top: 30px; font-size: 14px; color: #555;">
            Cheers,<br>The EaringBar Team
          </p>
        </div>
      </div>
    </div>
    `,
   };
  };
  
  export const CongratulationMail=(toEmail:string)=>{
    return {
        from:"theearingbar@gmail.com",
        to:toEmail,
        subject:"Welcome back!",
        html:`<html>
  <body style="font-family: 'Segoe UI', sans-serif; background-color: #f0f8ff; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background-color: white; border-radius: 8px; padding: 25px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <h1 style="color: #ff9800;">🎉 Congratulations!</h1>
      <p>You've successfully completed your first milestone with us.</p>
      <p>Keep up the amazing work!</p>
      <a href="https://yourapp.com/dashboard" style="padding: 10px 20px; background-color: #ff9800; color: white; text-decoration: none; border-radius: 5px;">Check Progress</a>
    </div>
  </body>
</html>
        `
        
    }
  }

  export const PasswordReset = (toEmail: string, code: string) => {
    return {
      from:"theearingbar@gmail.com",
      to: toEmail,
      subject: "Reset Your Password",
      html: `
  <html>
    <body style="font-family: 'Segoe UI', sans-serif; padding: 40px; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #d9534f; margin-bottom: 20px;">Password Reset Request</h2>
        <p style="font-size: 16px; color: #333;">Hi there,</p>
        <p style="font-size: 15px; color: #555;">You recently requested to reset your password. Use the code below to proceed:</p>
        
        <div style="margin: 30px 0; text-align: center;">
          <div style="display: inline-block; padding: 15px 30px; background-color: #d9534f; color: white; border-radius: 6px; font-size: 24px; letter-spacing: 2px; font-weight: bold;">
            ${code}
          </div>
        </div>
  
        <p style="font-size: 14px; color: #888;">If you did not request a password reset, you can safely ignore this email.</p>
        <p style="font-size: 13px; color: #aaa; margin-top: 40px;">— Mithila Ornaments Support Team</p>
      </div>
    </body>
  </html>
      `
    };
  };




export const newsLetterMail = async (fromMail: string) => {

  return {
      from: process.env.USER,
      to: fromMail,
      subject: '✨ Welcome to Mithila Ornaments – Let’s Shine Together!',
      html: `
        <div style="background-color:#fff8ef;padding:30px 20px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#333;">
          <div style="max-width:600px;margin:0 auto;border:1px solid #e0c097;border-radius:8px;overflow:hidden;">
            <div style="background-color:#d4af37;padding:20px;text-align:center;color:white;">
              <h1 style="margin:0;font-size:24px;">Welcome to Mithila Ornaments!</h1>
            </div>
            <div style="padding:20px;">
              <p style="font-size:16px;">Hi there,</p>
              <p style="font-size:16px;">
                Thank you for <strong>subscribing</strong> to our newsletter! 🌟<br/>
                We're thrilled to have you join our shining family.
              </p>
              <p style="font-size:16px;">
                From timeless classics to new releases, you’ll be the first to know about:
              </p>
              <ul style="font-size:16px; padding-left: 20px;">
                <li>💎 Exclusive deals and offers</li>
                <li>🆕 Latest collections</li>
                <li>🎁 Special festive surprises</li>
              </ul>
              <div style="text-align:center;margin:30px 0;">
                <a href="https://mithilaornaments.com" style="background-color:#d4af37;color:white;padding:12px 24px;border-radius:5px;text-decoration:none;font-weight:bold;font-size:16px;">
                  Explore Collection
                </a>
              </div>
              <p style="font-size:15px;color:#555;">
                Stay golden, stay elegant.<br/>
                With love,<br/>
                <strong>Team Mithila Ornaments</strong>
              </p>
            </div>
            <div style="background-color:#f4f0e6;padding:15px;text-align:center;font-size:12px;color:#777;">
              © ${new Date().getFullYear()} Mithila Ornaments. All rights reserved.<br/>
              You’re receiving this email because you subscribed on our website.
            </div>
          </div>
        </div>
      `,
  
  }
 
};

// export const orderNotificationMail = async (founderEmail: string,orderItems: any[],address: any
// ) => {
//   const [customerName, whatsapp] = address.label.split('|').map((s: string) => s.trim());

//   const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

//   const orderTableRows = orderItems
//     .map(
//       (item, index) => `
//         <tr style="border-bottom:1px solid #eee;">
//           <td style="padding:10px;">${index + 1}</td>
//           <td style="padding:10px;">${item.product.name}</td>
//           <td style="padding:10px;">${item.quantity}</td>
//           <td style="padding:10px;">₹${item.price}</td>
//         </tr>`
//     )
//     .join('');

//   return {
//     from: `"Mithila Ornaments" <${process.env.MAIL_USER}>`,
//     to: founderEmail,
//     subject: '🛒 New Order Received – Details Inside!',
//     html: `
//       <div style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f9f5ef; padding:20px;">
//         <div style="max-width:700px; margin:0 auto; background-color:white; border:1px solid #e0c097; border-radius:8px;">
//           <div style="background-color:#d4af37; padding:20px; color:white; text-align:center;">
//             <h2 style="margin:0;">New Order Received!</h2>
//           </div>
//           <div style="padding:20px;">
//             <h3 style="margin-bottom:10px;">📦 Ordered Items:</h3>
//             <table style="width:100%; border-collapse:collapse;">
//               <thead style="background-color:#f3efe7;">
//                 <tr>
//                   <th style="padding:10px; text-align:left;">#</th>
//                   <th style="padding:10px; text-align:left;">Product</th>
//                   <th style="padding:10px; text-align:left;">Qty</th>
//                   <th style="padding:10px; text-align:left;">Price</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 ${orderTableRows}
//               </tbody>
//             </table>
//             <p style="margin-top:15px; font-size:16px;"><strong>Total:</strong> ₹${totalAmount}</p>

//             <h3 style="margin-top:30px;">📍 Shipping Details:</h3>
//             <p><strong>Name:</strong> ${customerName}</p>
//             <p><strong>WhatsApp:</strong> ${whatsapp}</p>
//             <p><strong>Street:</strong> ${address.street}</p>
//             <p><strong>City:</strong> ${address.city}</p>
//             <p><strong>State:</strong> ${address.state}</p>
//             <p><strong>Country:</strong> ${address.country}</p>
//             <p><strong>Zip Code:</strong> ${address.zipCode}</p>
//           </div>
//           <div style="background-color:#f0ece6; text-align:center; padding:12px; font-size:12px; color:#777;">
//             © ${new Date().getFullYear()} Mithila Ornaments. This order was generated from the official website.
//           </div>
//         </div>
//       </div>
//     `,
//   };
// };



export const orderNotificationMail = async (
  founderEmail: string,
  orderItems: any[],
  address: any,
  account: { email: string; firstName: string; lastName: string }
) => {
  const [customerNameFromLabel, whatsapp] = address.label.split('|').map((s: string) => s.trim());
  const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const fullName = `${account.firstName} ${account.lastName}`;

  const orderTableRows = orderItems
    .map(
      (item, index) => `
        <tr style="border-bottom:1px solid #eee;">
          <td style="padding:10px;">${index + 1}</td>
          <td style="padding:10px;">${item.product.name}</td>
          <td style="padding:10px;">${item.quantity}</td>
          <td style="padding:10px;">₹${item.price}</td>
        </tr>`
    )
    .join('');

  return {
    from: `"Mithila Ornaments" <${process.env.USER}>`,
    to: founderEmail,
    subject: '🛒 New Order Received – Details Inside!',
    html: `
      <div style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f9f5ef; padding:20px;">
        <div style="max-width:700px; margin:0 auto; background-color:white; border:1px solid #e0c097; border-radius:8px;">
          <div style="background-color:#d4af37; padding:20px; color:white; text-align:center;">
            <h2 style="margin:0;">New Order Notification</h2>
          </div>
          <div style="padding:20px;">
            <h3 style="margin-bottom:8px;">👤 Ordered By:</h3>
            <p><strong>Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${account.email}</p>

            <h3 style="margin-top:25px; margin-bottom:8px;">📦 Order Items:</h3>
            <table style="width:100%; border-collapse:collapse;">
              <thead style="background-color:#f3efe7;">
                <tr>
                  <th style="padding:10px; text-align:left;">#</th>
                  <th style="padding:10px; text-align:left;">Product</th>
                  <th style="padding:10px; text-align:left;">Qty</th>
                  <th style="padding:10px; text-align:left;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${orderTableRows}
              </tbody>
            </table>
            <p style="margin-top:15px; font-size:16px;"><strong>Total:</strong> ₹${totalAmount}</p>

            <h3 style="margin-top:25px; margin-bottom:8px;">📍 Shipping Address:</h3>
            <p><strong>Name on Address:</strong> ${customerNameFromLabel}</p>
            <p><strong>WhatsApp:</strong> ${whatsapp}</p>
            <p><strong>Street:</strong> ${address.street}</p>
            <p><strong>City:</strong> ${address.city}</p>
            <p><strong>State:</strong> ${address.state}</p>
            <p><strong>Country:</strong> ${address.country}</p>
            <p><strong>Zip Code:</strong> ${address.zipCode}</p>
          </div>
          <div style="background-color:#f0ece6; text-align:center; padding:12px; font-size:12px; color:#777;">
            © ${new Date().getFullYear()} Mithila Ornaments. This order was placed through the official website.
          </div>
        </div>
      </div>
    `,
  };
};
