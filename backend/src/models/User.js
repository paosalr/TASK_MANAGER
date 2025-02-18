const db = require('../firebase');

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
}

module.exports = User;
