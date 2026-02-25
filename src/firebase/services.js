import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc,
  addDoc, deleteDoc, query, orderBy, where, serverTimestamp
} from 'firebase/firestore'
import {
  ref, uploadBytes, getDownloadURL, deleteObject
} from 'firebase/storage'
import { db, storage } from './config'

// ---- Site Config (Home, About) ----
export async function getSiteConfig(page) {
  const docRef = doc(db, 'siteConfig', page)
  const snap = await getDoc(docRef)
  return snap.exists() ? snap.data() : null
}

export async function updateSiteConfig(page, data) {
  const docRef = doc(db, 'siteConfig', page)
  await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true })
}

// ---- Services ----
export async function getServices() {
  const q = query(collection(db, 'services'), orderBy('order'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function addService(serviceData) {
  return addDoc(collection(db, 'services'), {
    ...serviceData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}

export async function updateService(id, serviceData) {
  const docRef = doc(db, 'services', id)
  await updateDoc(docRef, { ...serviceData, updatedAt: serverTimestamp() })
}

export async function deleteService(id) {
  await deleteDoc(doc(db, 'services', id))
}

// ---- Add-ons ----
export async function getAddons() {
  const q = query(collection(db, 'addons'), orderBy('order'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function addAddon(addonData) {
  return addDoc(collection(db, 'addons'), {
    ...addonData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}

export async function updateAddon(id, addonData) {
  const docRef = doc(db, 'addons', id)
  await updateDoc(docRef, { ...addonData, updatedAt: serverTimestamp() })
}

export async function deleteAddon(id) {
  await deleteDoc(doc(db, 'addons', id))
}

// ---- Reviews ----
export async function getReviews() {
  const q = query(collection(db, 'reviews'), orderBy('order'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function addReview(reviewData) {
  return addDoc(collection(db, 'reviews'), {
    ...reviewData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}

export async function updateReview(id, reviewData) {
  const docRef = doc(db, 'reviews', id)
  await updateDoc(docRef, { ...reviewData, updatedAt: serverTimestamp() })
}

export async function deleteReview(id) {
  await deleteDoc(doc(db, 'reviews', id))
}

// ---- Image Upload ----
export async function uploadImage(file, folder) {
  const fileName = `${Date.now()}_${file.name}`
  const storageRef = ref(storage, `${folder}/${fileName}`)
  const snapshot = await uploadBytes(storageRef, file)
  return getDownloadURL(snapshot.ref)
}

export async function deleteImage(url) {
  try {
    const storageRef = ref(storage, url)
    await deleteObject(storageRef)
  } catch (err) {
    console.warn('Could not delete image from storage:', err)
  }
}

// ---- Time Slots ----
export async function getTimeSlots() {
  const q = query(collection(db, 'timeSlots'), orderBy('date'))
  const snap = await getDocs(q)
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => a.date.localeCompare(b.date) || (a.startTime || '').localeCompare(b.startTime || ''))
}

export async function getAvailableSlots() {
  const today = new Date().toISOString().split('T')[0]
  const q = query(collection(db, 'timeSlots'), orderBy('date'))
  const snap = await getDocs(q)
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(s => s.status === 'open' && s.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.startTime || '').localeCompare(b.startTime || ''))
}

export async function addTimeSlot(data) {
  return addDoc(collection(db, 'timeSlots'), {
    ...data,
    status: 'open',
    bookingId: null,
    createdAt: serverTimestamp()
  })
}

export async function addTimeSlotsBatch(slotsArray) {
  const results = []
  for (const data of slotsArray) {
    const ref = await addDoc(collection(db, 'timeSlots'), {
      ...data,
      status: 'open',
      bookingId: null,
      createdAt: serverTimestamp()
    })
    results.push({ id: ref.id, ...data, status: 'open', bookingId: null })
  }
  return results
}

export async function deleteTimeSlot(id) {
  await deleteDoc(doc(db, 'timeSlots', id))
}

export async function updateTimeSlot(id, data) {
  const docRef = doc(db, 'timeSlots', id)
  await updateDoc(docRef, data)
}

// ---- Bookings ----
export async function getBookings() {
  const q = query(collection(db, 'bookings'), orderBy('date'))
  const snap = await getDocs(q)
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => a.date.localeCompare(b.date) || (a.startTime || '').localeCompare(b.startTime || ''))
}

export async function addBooking(data) {
  return addDoc(collection(db, 'bookings'), {
    ...data,
    status: 'confirmed',
    createdAt: serverTimestamp()
  })
}

export async function cancelBooking(bookingId, timeSlotId) {
  const bookingRef = doc(db, 'bookings', bookingId)
  await updateDoc(bookingRef, { status: 'cancelled' })
  const slotRef = doc(db, 'timeSlots', timeSlotId)
  await updateDoc(slotRef, { status: 'open', bookingId: null })
}

export async function getTimeSlotDoc(id) {
  const docRef = doc(db, 'timeSlots', id)
  const snap = await getDoc(docRef)
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

// ---- Admin Check ----
export async function isAdminUser(uid) {
  const docRef = doc(db, 'adminUsers', uid)
  const snap = await getDoc(docRef)
  return snap.exists()
}
