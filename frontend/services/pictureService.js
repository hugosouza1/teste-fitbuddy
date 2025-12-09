import { ref, uploadBytes, deleteObject, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebaseConfig";

export async function uploadToFirebase(pictureURI, storagePath) {
  const imageReference = ref(storage, storagePath);
  
  const response = await fetch(pictureURI);
  const blob = await response.blob(); 
  await uploadBytes(imageReference, blob);

  const url = await getDownloadURL(imageReference);
  return url
}

export async function deleteImageFromFirebase(storagePath){
  const imageReference = ref(storage, storagePath);
  await deleteObject(imageReference);
  return true;
};
