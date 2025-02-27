const db = require('../config/firebase');

class User {
  static async create(userData) {
    const userRef = db.collection('users').doc();
    await userRef.set(userData);
    return userRef.id;
  }

  static async findByEmail(email) {
    const userRef = db.collection('users').where('email', '==', email).limit(1);
    const userDoc = await userRef.get();
    if (userDoc.empty) return null;
    return { id: userDoc.docs[0].id, ...userDoc.docs[0].data() };
  }

  static async updateRole(userId, newRole) {
    const userRef = db.collection('users').doc(userId);
    await userRef.update({ role: newRole });
  }

  static async findAll() {
    const usersRef = db.collection('users');
    const usersDoc = await usersRef.get();
    return usersDoc.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

module.exports = User;
