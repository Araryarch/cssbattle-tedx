import { getEligibleCertificateUsersAction } from "@/lib/user-actions";
import CertificateButton from "@/components/profile/CertificateButton";
import { Eye, User as UserIcon } from "lucide-react";

export const metadata = {
  title: "Manage Certificates | Admin",
};

export default async function AdminCertificatesPage() {
    const users = await getEligibleCertificateUsersAction();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Manage Certificates</h1>
                    <p className="text-zinc-500 mt-1">
                        View and print certificates for eligible participants (Rank 4flex and above).
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-white">{users.length}</p>
                    <p className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Eligible Users</p>
                </div>
            </div>

            <div className="bg-zinc-900 border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-zinc-400 uppercase font-bold text-xs tracking-wider">
                            <tr>
                                <th className="p-4">Participant</th>
                                <th className="p-4">Rank Achieved</th>
                                <th className="p-4">Email</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-zinc-500 italic">
                                        No participants have reached the required rank (4flex+) yet.
                                    </td>
                                </tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center border border-white/5">
                                                    {user.image ? (
                                                        <img src={user.image} alt="" className="w-full h-full object-cover"/>
                                                    ) : (
                                                        <UserIcon className="w-5 h-5 text-zinc-600"/> 
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">{user.name || "Unnamed"}</p>
                                                    <p className="text-zinc-500 text-xs font-mono truncate max-w-[150px]">{user.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                                                user.rank === 'dev' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                user.rank === '1grid' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>
                                                {user.rank}
                                            </span>
                                        </td>
                                        <td className="p-4 text-zinc-400">
                                            {user.email}
                                        </td>
                                        <td className="p-4 text-right">
                                            <CertificateButton 
                                                user={user} 
                                                className="inline-flex bg-white/5 hover:bg-white/10 text-white shadow-none px-4 py-2 h-auto text-xs font-bold uppercase tracking-wider border border-white/10"
                                            >
                                                <Eye className="w-3.5 h-3.5" /> Preview
                                            </CertificateButton>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
