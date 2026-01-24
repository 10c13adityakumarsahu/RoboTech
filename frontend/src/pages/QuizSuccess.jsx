import { useNavigate } from "react-router-dom";

export default function QuizSuccess() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white text-center">
            <div className="max-w-md w-full">
                <div className="w-24 h-24 bg-green-600/20 text-green-500 rounded-full mx-auto flex items-center justify-center text-4xl mb-8 border-2 border-green-500/30 animate-bounce">
                    ✓
                </div>
                <h1 className="text-3xl font-black font-[Orbitron] uppercase tracking-tighter mb-4">Transmission Finalized</h1>
                <p className="text-gray-500 text-sm mb-12">Intelligence assessment packets have been securely uploaded to the central database. Your evaluation data is now locked.</p>

                <button
                    onClick={() => navigate("/")}
                    className="w-full py-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all"
                >
                    Return to Surface Level
                </button>
            </div>
        </div>
    );
}
