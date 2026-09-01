/**
 * ClassMate Practicum - Authentication & Multi-User Manager
 */

class AuthManager {
  constructor() {
    this.usersKey = 'classmate_users_registry_v1';
    this.sessionKey = 'classmate_active_session_id';
    this.currentUser = null;

    this.init();
  }

  init() {
    const sessionUserId = sessionStorage.getItem(this.sessionKey) || localStorage.getItem(this.sessionKey);
    const users = this.getRegisteredUsers();

    // Check URL parameters for direct student portfolio viewing (e.g., ?id=65011428019)
    const urlParams = new URLSearchParams(window.location.search);
    const urlStudentId = urlParams.get('id') || urlParams.get('user');

    if (urlStudentId) {
      const found = users.find(u => u.studentId === urlStudentId);
      if (found) {
        if (sessionUserId === urlStudentId) {
          this.currentUser = found;
        } else {
          // Public view of another student
          this.viewingStudent = found;
        }
      }
    } else if (sessionUserId) {
      this.currentUser = users.find(u => u.studentId === sessionUserId) || null;
    }
  }

  getRegisteredUsers() {
    try {
      const data = localStorage.getItem(this.usersKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  saveRegisteredUsers(users) {
    localStorage.setItem(this.usersKey, JSON.stringify(users));
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isLoggedIn() {
    return !!this.currentUser;
  }

  // Register new student account
  register(studentData, password) {
    const users = this.getRegisteredUsers();
    const studentId = studentData.studentId.trim();

    if (users.some(u => u.studentId === studentId)) {
      return { success: false, message: 'รหัสนักศึกษานี้มีอยู่ในระบบแล้ว กรุณาเข้าสู่ระบบ' };
    }

    const newUser = {
      studentId: studentId,
      fullName: studentData.fullName.trim(),
      major: studentData.major.trim(),
      faculty: studentData.faculty.trim(),
      university: studentData.university.trim(),
      password: password,
      registeredAt: Date.now()
    };

    users.push(newUser);
    this.saveRegisteredUsers(users);

    // Initialize custom portfolio data for this new student
    const initialPortfolio = JSON.parse(JSON.stringify(DEFAULT_PRACTICUM_DATA));
    initialPortfolio.student.fullName = newUser.fullName;
    initialPortfolio.student.studentId = newUser.studentId;
    initialPortfolio.student.major = newUser.major;
    initialPortfolio.student.faculty = newUser.faculty;
    initialPortfolio.student.university = newUser.university;

    window.appStorage.saveDataForUser(newUser.studentId, initialPortfolio);

    // Log the user in
    this.setSession(newUser);
    return { success: true, user: newUser };
  }

  // Login with student ID & password
  login(studentId, password) {
    const users = this.getRegisteredUsers();
    const cleanId = studentId.trim();
    const user = users.find(u => u.studentId === cleanId && u.password === password);

    if (!user) {
      return { success: false, message: 'รหัสนักศึกษาหรือรหัสผ่านไม่ถูกต้อง' };
    }

    this.setSession(user);
    return { success: true, user: user };
  }

  setSession(user) {
    this.currentUser = user;
    sessionStorage.setItem(this.sessionKey, user.studentId);
    localStorage.setItem(this.sessionKey, user.studentId);
  }

  logout() {
    this.currentUser = null;
    sessionStorage.removeItem(this.sessionKey);
    localStorage.removeItem(this.sessionKey);
    window.location.href = window.location.pathname;
  }
}

window.appAuth = new AuthManager();
