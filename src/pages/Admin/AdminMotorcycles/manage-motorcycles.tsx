import  { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumb from "../../../components/AdminBreadcrums";
import Header from "../../../layouts/AdminLayouts/AdminHeader";
import Sidemenu from "../../../layouts/AdminLayouts/AdminSidemenu";
import {
    getMotorcycles,
    Motorcycle as MotorcycleType
} from "../../../api/motorcycleApi";
import ImageWithFallback from "../../../components/ImageWithFallback";
import { useAuth } from '../../../contexts/AuthContext';
import PageLoading from "../../../components/PageLoading";

function AdminManageMotorcycles() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [motorcycles, setMotorcycles] = useState<MotorcycleType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedBrand, setSelectedBrand] = useState("All"); // Simplified brand filtering
    const [sortOption, setSortOption] = useState("Default");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (user?.role !== 'admin') {
            navigate('/'); // Redirect non-admins
            return;
        }

        const fetchMotorcycles = async () => {
            try {
                setLoading(true);
                const data = await getMotorcycles();
                setMotorcycles(data);
                setError(null);
            } catch (err) {
                setError("Failed to fetch motorcycles.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMotorcycles();
    }, [user, navigate]);

    const filteredMotorcycles = motorcycles.filter((motorcycle) => {
        const nameLower = motorcycle.name.toLowerCase();
        const termLower = searchTerm.toLowerCase();
        const brandLower = selectedBrand.toLowerCase();

        const nameMatch = nameLower.includes(termLower);
        const brandMatch = selectedBrand === "All" || nameLower.includes(brandLower); // Basic brand check in name

        return nameMatch && brandMatch;
    });

    const sortedMotorcycles = [...filteredMotorcycles].sort((a, b) => {
        switch (sortOption) {
            case "Popularity":
                return (a.id ?? 0) - (b.id ?? 0); // Assuming ID as proxy for popularity
            case "Latest":
                return (b.id ?? 0) - (a.id ?? 0);
            case "Low to High":
                return a.price - b.price;
            case "High to Low":
                return b.price - a.price;
            default:
                return (a.id ?? 0) - (b.id ?? 0);
        }
    });

    // Static list of brands for now
    const brands = ["All", "Honda", "Suzuki", "Kawasaki", "Yamaha"];

    if (loading) {
        return <PageLoading />;
    }

    return (
        <>
            <Header />
            <Sidemenu />
            <div className="main-content app-content">
                <div className="container-fluid mx-auto px-4 py-6">
                    <div className="flex justify-between items-center mb-6">
                        <Breadcrumb
                            title="Manage Motorcycles"
                            active="Motorcycles"
                        />
                        <Link 
                            to="/admin/motorcycles/add" 
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <i className="ri-add-line"></i> Add Motorcycle
                        </Link>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                        <div className="p-6">
                            <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                                <div className="relative flex-1 max-w-md">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <i className="ri-search-line text-gray-400"></i>
                                    </div>
                                    <input 
                                        type="text" 
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Search Model Name"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <select
                                        className="border border-gray-300 rounded-lg bg-white text-gray-700 py-2 px-4 focus:ring-blue-500 focus:border-blue-500"
                                        value={sortOption}
                                        onChange={(e) => setSortOption(e.target.value)}
                                    >
                                        <option value="Default">Default sorting</option>
                                        <option value="Popularity">Sort by popularity</option>
                                        <option value="Latest">Sort by latest</option>
                                        <option value="Low to High">Price: low to high</option>
                                        <option value="High to Low">Price: high to low</option>
                                    </select>

                                    <select
                                        className="border border-gray-300 rounded-lg bg-white text-gray-700 py-2 px-4 focus:ring-blue-500 focus:border-blue-500"
                                        value={selectedBrand}
                                        onChange={(e) => setSelectedBrand(e.target.value)}
                                    >
                                        {brands.map(brand => (
                                            <option key={brand} value={brand}>{brand}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {sortedMotorcycles.length === 0 ? (
                                <div className="text-center py-8 text-gray-600">
                                    No motorcycles found matching your criteria.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {sortedMotorcycles.map((motorcycle) => (
                                        <Link 
                                            to={`/admin/motorcycles/edit/${motorcycle.id}`} 
                                            key={motorcycle.id} 
                                            className="block group"
                                        >
                                            <div className="border border-gray-300 p-3 rounded shadow-sm hover:shadow-lg transition rounded-lg overflow-hidden">
                                                <div className="aspect-w-16 aspect-h-9 mb-2 overflow-hidden">
                                                    <ImageWithFallback
                                                        urlField={motorcycle.image_path || null}
                                                        fileType="motorcycles"
                                                        alt={motorcycle.name}
                                                        className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                                                    />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-800 truncate">{motorcycle.name}</h3>
                                                <div className="bg-red-600 text-white rounded-md p-3 mt-1">
                                                    <h6 className="font-bold text-white">₱{motorcycle.price.toLocaleString()}.00</h6>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
                                <div>
                                    Showing {sortedMotorcycles.length} of {motorcycles.length} results
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
export default AdminManageMotorcycles;
