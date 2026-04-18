export default function Navbar() {
  return (
    <div className="flex justify-between items-center bg-gray-800 px-6 py-4 text-white">
      
      <h2 className="text-lg">
        Good evening 👋
      </h2>

      <button 
        className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg"
        onClick={() => alert("Open transaction modal")}
      >
        + Add Transaction
      </button>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }}
        className="bg-red-500 px-4 py-2 rounded"
      >
        Logout
      </button>

    </div>
  );
}