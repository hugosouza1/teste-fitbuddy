const bucket = require("../../config/firebaseAdmin.js");

async function deleteUserPictures(email) {
  const userFolderPath = `users/${email}`;

  const [files] = await bucket.getFiles({ prefix: userFolderPath });

  if (files.length === 0) {
    return;
  }

  const deletePromises = files.map(file => file.delete());
  await Promise.all(deletePromises);
}

module.exports = { deleteUserPictures };
