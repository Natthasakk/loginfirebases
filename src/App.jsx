import React, { useState, useEffect } from 'react';
import { Lock, User, Database, ArrowRight, Table, AlertCircle, LogOut, UserCircle, Loader2, RefreshCw } from 'lucide-react';

// ------------------------------------------------------------------
// 1. นำเข้า Firebase SDK
// ------------------------------------------------------------------
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

// ==========================================
// ⚠️ ส่วนที่ต้องแก้ไข (FIREBASE CONFIGURATION) ⚠️
// ==========================================
// นำค่า firebaseConfig ที่ได้จาก Firebase Console มาวางตรงนี้
const firebaseConfig = {
  apiKey: "AIzaSyCBnkAInHGM2j5oJPaJp5N5kGHS4_W9ab4",
  authDomain: "loginfirebases-c6ff7.firebaseapp.com",
  projectId: "loginfirebases-c6ff7",
  storageBucket: "loginfirebases-c6ff7.firebasestorage.app",
  messagingSenderId: "902284317690",
  appId: "1:902284317690:web:949ca81f25f8854c978a43",
  measurementId: "G-VVS2M4B3ZE"
};
// ==========================================

// 2. เริ่มต้นใช้งาน Firebase
// เช็คว่าใส่ Config หรือยัง เพื่อกัน Error หน้าขาว
let auth, db;
try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "AIzaSy...") {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (e) {
  console.error("Firebase Init Error:", e);
}

export default function App() {
  const [view, setView] = useState('login'); 
  const [loading, setLoading] = useState(false);     
  const [dataLoading, setDataLoading] = useState(false); 
  const [error, setError] = useState('');
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [user, setUser] = useState(null);
  const [sheetData, setSheetData] = useState([]);

  // ฟังก์ชัน Login ด้วย Firebase
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!auth) {
      setError('⚠️ ยังไม่ได้ใส่ Firebase Config ในโค้ด (ดูบรรทัดที่ 15)');
      setLoading(false);
      return;
    }

    try {
      // แปลง Username เป็น Email (เพราะ Firebase บังคับใช้อีเมล)
      // สมมติว่า User พิมพ์แค่ "admin" เราจะเติม "@test.com" ให้เองอัตโนมัติ
      // หรือถ้าเขาพิมพ์อีเมลมาเต็มๆ ก็ใช้ได้เลย
      const emailToUse = username.includes('@') ? username : `${username}@test.com`;

      const userCredential = await signInWithEmailAndPassword(auth, emailToUse, password);
      const firebaseUser = userCredential.user;
      
      // ดึงชื่อ Username หน้า @ มาแสดง
      const displayUsername = firebaseUser.email.split('@')[0];

      const userData = { 
        name: displayUsername, 
        username: displayUsername, // ใช้ชื่อนี้ไป query ข้อมูล
        email: firebaseUser.email 
      };
      
      setUser(userData);
      
      // สั่งให้หมุนรอก่อนเปลี่ยนหน้า
      setDataLoading(true); 
      setView('dashboard');
      
      // ดึงข้อมูล
      fetchData(userData.username); 

    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      } else {
        setError(`เกิดข้อผิดพลาด: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันดึงข้อมูลจาก Firestore
  const fetchData = async (currentUsername) => {
    const userToFetch = currentUsername || user?.username;
    if (!userToFetch || !db) return;

    setDataLoading(true); 
    
    try {
      // Query ข้อมูลจาก Collection "data" ที่มี field "username" ตรงกับคนล็อกอิน
      const q = query(
        collection(db, "data"), 
        where("username", "==", userToFetch)
      );

      const querySnapshot = await getDocs(q);
      
      const fetchedData = [];
      querySnapshot.forEach((doc) => {
        // นำข้อมูลออกมา และแถม ID ของเอกสารไปด้วย (เผื่อใช้)
        fetchedData.push({ id: doc.id, ...doc.data() });
      });

      setSheetData(fetchedData);

    } catch (err) {
      console.error("Failed to fetch data", err);
      // กรณี ErrorPermission (มักเกิดจากลืมตั้ง Rules หรือ Index)
      if (err.code === 'permission-denied') {
        alert("Permission Denied: ตรวจสอบ Firestore Rules ใน Console");
      }
    } finally {
      setDataLoading(false); 
    }
  };

  const handleLogout = async () => {
    if (auth) await signOut(auth);
    setUser(null);
    setSheetData([]);
    setUsername('');
    setPassword('');
    setView('login');
  };

  // ---------------- UI Components ----------------

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center p-4 font-sans">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-orange-600 p-6 text-center">
            <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
              <Database className="text-white w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">ระบบสมาชิก Firebase</h2>
            <p className="text-orange-100 text-sm mt-1">รวดเร็ว ปลอดภัย รองรับผู้ใช้ไม่จำกัด</p>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex flex-col gap-1 text-sm">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-5 h-5" />
                  เข้าสู่ระบบไม่ได้
                </div>
                <span className="text-xs opacity-90">{error}</span>
              </div>
            )}
            
            {(!firebaseConfig.apiKey || firebaseConfig.apiKey === "AIzaSy...") && (
               <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm text-center animate-pulse">
                 <b>Developer Alert:</b><br/>
                 กรุณาใส่ Firebase Config ในไฟล์ App.jsx (บรรทัดที่ 15)
               </div>
            )}

            <div className="space-y-4 pt-2">
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  placeholder="Username (เช่น admin)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                />
              </div>
              <p className="text-xs text-gray-400 text-center">
                *ระบบจะเติม @test.com ให้ username อัตโนมัติ (Mock Email)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !auth}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> 
                  กำลังตรวจสอบ...
                </>
              ) : (
                <>
                  เข้าสู่ระบบ <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }