import React, { useState, useEffect } from 'react';
import { Lock, User, Database, ArrowRight, Table, AlertCircle, LogOut, UserCircle, Loader2, RefreshCw } from 'lucide-react';

// ==========================================
// ⚠️ ส่วนที่ต้องแก้ไข (CONFIGURATION) ⚠️
// ==========================================
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwecK0DWgd5dFJz8SMXE3_Y6v5efsyO_JFi6IHLUCEROoNAynQHgvSkm9hHOYQNOkuanw/exec"; 
// ==========================================

export default function App() {
  const [view, setView] = useState('login'); 
  const [loading, setLoading] = useState(false);     
  const [dataLoading, setDataLoading] = useState(false); 
  const [error, setError] = useState('');
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [user, setUser] = useState(null);
  const [sheetData, setSheetData] = useState([]);

  // ฟังก์ชัน Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!GOOGLE_SCRIPT_URL) {
      setError('⚠️ ยังไม่ได้ใส่ URL ในโค้ด: กรุณาแก้ไขบรรทัดที่ 8 ของไฟล์ App.jsx');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ 
          action: 'login', 
          username, 
          password 
        })
      });

      if (!response.ok) throw new Error(`Status: ${response.status}`);

      const result = await response.json();

      if (result.status === 'success') {
        const userData = { name: result.name, username: username };
        setUser(userData);
        
        // ✅ แก้ไขจุดนี้: สั่งให้หมุนรอก่อนเปลี่ยนหน้าทันที
        setDataLoading(true); 
        setView('dashboard');
        
        // แล้วค่อยดึงข้อมูล
        fetchData(userData.username); 
      } else {
        setError(result.message || 'เข้าสู่ระบบไม่สำเร็จ');
      }
    } catch (err) {
      console.error(err);
      setError('เชื่อมต่อไม่ได้: ตรวจสอบ URL หรือ Internet');
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันดึงข้อมูล
  const fetchData = async (currentUsername) => {
    const userToFetch = currentUsername || user?.username;
    if (!userToFetch || !GOOGLE_SCRIPT_URL) return;

    // ตั้งค่า Loading เป็น true อีกรอบเพื่อความชัวร์ (กรณีปุ่ม Refresh)
    setDataLoading(true); 
    
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ 
          action: 'getData', 
          username: userToFetch
        })
      });
      const result = await response.json();
      if (result.status === 'success') {
        setSheetData(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setDataLoading(false); // หยุดหมุนเมื่อเสร็จจริง
    }
  };

  const handleLogout = () => {
    setUser(null);
    setSheetData([]);
    setUsername('');
    setPassword('');
    setView('login');
  };

  // ---------------- UI Components ----------------

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 font-sans">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-indigo-600 p-6 text-center">
            <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
              <Database className="text-white w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">ระบบสมาชิก</h2>
            <p className="text-indigo-200 text-sm mt-1">เข้าสู่ระบบเพื่อดูข้อมูลของคุณ</p>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex flex-col gap-1 text-sm">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-5 h-5" />
                  เกิดข้อผิดพลาด
                </div>
                <span className="text-xs opacity-90">{error}</span>
              </div>
            )}
            
            {!GOOGLE_SCRIPT_URL && (
               <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm text-center animate-pulse">
                 <b>Developer Alert:</b><br/>
                 กรุณาใส่ URL ในโค้ดบรรทัดที่ 8 ก่อนใช้งาน
               </div>
            )}

            <div className="space-y-4 pt-2">
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !GOOGLE_SCRIPT_URL}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Database className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-gray-800 text-lg hidden sm:block">MyData System</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                <UserCircle className="w-4 h-4 text-indigo-500" />
                <span className="hidden sm:inline">ผู้ใช้: </span>
                <b className="text-indigo-700">{user?.username}</b>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600 transition-colors p-2"
                title="ออกจากระบบ"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ข้อมูลส่วนตัวของคุณ</h1>
            <p className="text-gray-500 mt-1 text-sm">
              แสดงรายการสำหรับ: <b>{user?.username}</b>
            </p>
          </div>
          <button 
            onClick={() => fetchData(user?.username)}
            disabled={dataLoading}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2"
          >
             {dataLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
             รีเฟรชข้อมูล
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[300px]">
          {dataLoading ? (
            // ✅ ส่วนแสดงผลตอนกำลังโหลด (Loading State)
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
               <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-3" />
               <p className="font-medium">กำลังดึงข้อมูลจาก Google Sheets...</p>
               <p className="text-xs text-gray-400 mt-1">กรุณารอสักครู่</p>
            </div>
          ) : sheetData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(sheetData[0]).map((header, idx) => (
                      <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sheetData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      {Object.values(row).map((val, cellIdx) => (
                        <td key={cellIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // ✅ กรณีโหลดเสร็จแล้วแต่ไม่เจอข้อมูล
            <div className="flex flex-col items-center justify-center h-full p-12 text-center text-gray-400">
              <Table className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium text-gray-500">โหลดเสร็จแล้ว แต่ไม่พบข้อมูล</p>
              <div className="text-sm mt-3 bg-gray-50 p-4 rounded-lg max-w-md mx-auto text-left">
                <p className="font-semibold text-gray-700 mb-1">สิ่งที่ต้องตรวจสอบ:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>ใน Sheet <b>"Data"</b> มีคอลัมน์ชื่อ <code>username</code> หรือไม่?</li>
                  <li>ในแถวข้อมูล ช่อง username เขียนว่า <b>"{user?.username}"</b> ตรงกันเป๊ะๆ หรือไม่? (ระวังช่องว่าง)</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}