// src/utils/firestoreHelpers.js
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const configDocRef = doc(db, "formConfig", "mainConfig");

export async function getFormConfig() {
  const snap = await getDoc(configDocRef);
  if (!snap.exists()) return null;
  return snap.data();
}

export async function setFormConfig(payload) {
  // payload should be an object representing the config
  await setDoc(configDocRef, payload, { merge: true });
  return true;
}
