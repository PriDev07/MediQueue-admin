import { doc, getDoc, collection, query, where, getDocs, updateDoc, GeoPoint } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const firestoreService = {
  async getUserByEmail(email) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return {
          id: userDoc.id,
          ...userDoc.data()
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  async getClinicById(clinicId) {
    try {
      const clinicRef = doc(db, 'clinics', clinicId);
      const clinicSnap = await getDoc(clinicRef);
      
      if (clinicSnap.exists()) {
        return {
          id: clinicSnap.id,
          ...clinicSnap.data()
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching clinic:', error);
      throw error;
    }
  },

  async getClinicByUserEmail(email) {
    try {
      const userData = await this.getUserByEmail(email);
      if (!userData || !userData.clinicId) {
        throw new Error('User not found or no clinic associated');
      }
      
      const clinicData = await this.getClinicById(userData.clinicId);
      if (!clinicData) {
        throw new Error('Clinic not found');
      }
      
      return {
        user: userData,
        clinic: clinicData
      };
    } catch (error) {
      console.error('Error fetching clinic by user email:', error);
      throw error;
    }
  },

  async updateBedSection(clinicId, bedSectionData) {
    try {
      const clinicRef = doc(db, 'clinics', clinicId);
      await updateDoc(clinicRef, { bedSection: bedSectionData });
      return true;
    } catch (error) {
      console.error('Error updating bed section:', error);
      throw error;
    }
  },

  async updateBloodBank(clinicId, bloodBankData) {
    try {
      const clinicRef = doc(db, 'clinics', clinicId);
      await updateDoc(clinicRef, { bloodBank: bloodBankData });
      return true;
    } catch (error) {
      console.error('Error updating blood bank:', error);
      throw error;
    }
  },

  async updateDoctors(clinicId, doctorsData) {
    try {
      const clinicRef = doc(db, 'clinics', clinicId);
      await updateDoc(clinicRef, { doctors: doctorsData });
      return true;
    } catch (error) {
      console.error('Error updating doctors:', error);
      throw error;
    }
  },

  async updateDoctor(clinicId, doctorId, doctorData) {
    try {
      const clinicRef = doc(db, 'clinics', clinicId);
      const clinicSnap = await getDoc(clinicRef);
      
      if (clinicSnap.exists()) {
        const clinicData = clinicSnap.data();
        const updatedDoctors = {
          ...clinicData.doctors,
          [doctorId]: doctorData
        };
        
        await updateDoc(clinicRef, { doctors: updatedDoctors });
        return true;
      }
      throw new Error('Clinic not found');
    } catch (error) {
      console.error('Error updating doctor:', error);
      throw error;
    }
  },

  async availaibility(clinicId, clinicInfo) {
    try {
      const clinicRef = doc(db, 'clinics', clinicId);
      const updateData = {
        Name: clinicInfo.Name,
        Rating: clinicInfo.Rating,
        TokensProvided: clinicInfo.TokensProvided,
        location: clinicInfo.location,
      };

      if (clinicInfo.loc && clinicInfo.loc.latitude && clinicInfo.loc.longitude) {
        updateData.loc = new GeoPoint(clinicInfo.loc.latitude, clinicInfo.loc.longitude);
      }

      await updateDoc(clinicRef, updateData);
      return true;
    } catch (error) {
      console.error('Error updating clinic info:', error);
      throw error;
    }
  },
};
