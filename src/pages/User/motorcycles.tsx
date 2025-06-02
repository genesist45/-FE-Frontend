import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/UserBreadcrums";
import Header from "../../layouts/UserLayouts/UserHeader";
import Sidemenu from "../../layouts/UserLayouts/UserSidemenu";
import { getMotorcycles, Motorcycle as MotorcycleType } from "../../api/motorcycleApi";

// Import static motorcycle images
import Honda_winnerX from "../../assets/photos/motors/hondax.png";
import Honda_ADV_160 from "../../assets/photos/motors/hondaa.png";
import Honda_Click from "../../assets/photos/motors/hondaClick.png";
import Honda_Alpha from "../../assets/photos/motors/hondaAlpha.png";
import Honda_RS from "../../assets/photos/motors/hondaRS.png";
import Suzuki_Raider_Fi_150 from "../../assets/photos/motors/suzuki.png";
import Suzuki_Raider from "../../assets/photos/motors/suzuki-gsx.png";
import Kawasaki_klx from "../../assets/photos/motors/kawasaki.png";
import Kawasaki_Barako from "../../assets/photos/motors/kawasakiBarako.png";
import Kawasaki_CT100B from "../../assets/photos/motors/kawasakiCT100B.png";
import Kawasaki_CT from "../../assets/photos/motors/kawasakiCT.png";
import Yamaha_Mio_Gear_125 from "../../assets/photos/motors/mio_gear125.png";
import Yamaha_Mio_i125 from "../../assets/photos/motors/YamahaMioi125.png";
import Yamaha_Mio_Sporty from "../../assets/photos/motors/YamahaMioSporty.png";
import Suzuki_Burgman from "../../assets/photos/motors/SuzukiBurgman.png";

function UserMotorcycles() {
    const navigate = useNavigate();
    const [selectedBrand, setSelectedBrand] = useState("All");
    const [sortOption, setSortOption] = useState("Default");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [dynamicMotorcycles, setDynamicMotorcycles] = useState<MotorcycleType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const itemsPerPage = 12;

    // Static motorcycles data
    const staticMotorcycles = [
        { id: "static_1", brand: "Honda", model: "Honda WINNER X", price: "131,900", image: Honda_winnerX, Link: "/HondaX" },
        { id: "static_2", brand: "Honda", model: "Honda ADV 160", price: "164,900", image: Honda_ADV_160, Link: "/HondaADV" },
        { id: "static_3", brand: "Honda", model: "Honda CLICK125", price: "80,900", image: Honda_Click, Link: "/HondaClick" },
        { id: "static_4", brand: "Honda", model: "Honda TMX125 Alpha", price: "56,900", image: Honda_Alpha, Link: "/HondaAlpha" },
        { id: "static_5", brand: "Honda", model: "Honda RS125", price: "75,900", image: Honda_RS, Link: "/HondaRS" },
        { id: "static_6", brand: "Suzuki", model: "Suzuki Raider Fi 150", price: "119,900", image: Suzuki_Raider_Fi_150, Link: "/SuzukiFI" },
        { id: "static_7", brand: "Suzuki", model: "Suzuki GSX-S150", price: "133,900", image: Suzuki_Raider, Link: "/SuzukiGSX" },
        { id: "static_8", brand: "Suzuki", model: "Suzuki Burgman Street 125-EX", price: "92,400", image: Suzuki_Burgman, Link: "/SuzukiBurgman" },
        { id: "static_9", brand: "Kawasaki", model: "Kawasaki KLX150", price: "129,900", image: Kawasaki_klx, Link: "/KawasakiKLX" },
        { id: "static_10", brand: "Kawasaki", model: "Kawasaki Barako II 175", price: "90,500", image: Kawasaki_Barako, Link: "/KawasakiBarako" },
        { id: "static_11", brand: "Kawasaki", model: "Kawasaki CT125", price: "58,700", image: Kawasaki_CT, Link: "/KawasakiCT" },
        { id: "static_12", brand: "Kawasaki", model: "Kawasaki CT100B", price: "52,200", image: Kawasaki_CT100B, Link: "/KawasakiCT100B" },
        { id: "static_13", brand: "Yamaha", model: "Yamaha Mio Gear 125", price: "77,400", image: Yamaha_Mio_Gear_125, Link: "/YamahaMio" },
        { id: "static_14", brand: "Yamaha", model: "Yamaha Mio i125", price: "77,900", image: Yamaha_Mio_i125, Link: "/YamahaMioi125" },
        { id: "static_15", brand: "Yamaha", model: "Yamaha Mio Sporty", price: "73,900", image: Yamaha_Mio_Sporty, Link: "/YamahaMioSporty" },
    ];

    useEffect(() => {
        const fetchMotorcycles = async () => {
            try {
                setLoading(true);
                const data = await getMotorcycles();
                setDynamicMotorcycles(data);
                setError(null);
            } catch (err) {
                setError("Failed to fetch motorcycles.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMotorcycles();
    }, []);

    // Combine static and dynamic motorcycles
    const allMotorcycles = [
        ...staticMotorcycles,
        ...dynamicMotorcycles.map(m => ({
            id: `dynamic_${m.id}`,
            brand: getBrandFromName(m.name),
            model: m.name,
            price: m.price.toLocaleString(),
            image: m.image_path || '/placeholder-motorcycle.png',
            Link: `/motorcycles/${m.id}`,
            isDynamic: true
        }))
    ];

    // Helper function to extract brand from motorcycle name
    function getBrandFromName(name: string): string {
        const brands = ["Honda", "Suzuki", "Kawasaki", "Yamaha"];
        for (const brand of brands) {
            if (name.toLowerCase().includes(brand.toLowerCase())) {
                return brand;
            }
        }
        return "Other";
    }

    const filteredMotorcycles = allMotorcycles.filter((motorcycle) => {
        if (selectedBrand === "All") return true;
        return motorcycle.brand === selectedBrand;
    }).filter((motorcycle) => {
        return motorcycle.model.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const sortedMotorcycles = filteredMotorcycles.sort((a, b) => {
        switch (sortOption) {
            case "Popularity":
                return a.id.localeCompare(b.id);
            case "Latest":
                return b.id.localeCompare(a.id);
            case "Low to High":
                return parseFloat(a.price.replace(/,/g, "")) - parseFloat(b.price.replace(/,/g, ""));
            case "High to Low":
                return parseFloat(b.price.replace(/,/g, "")) - parseFloat(a.price.replace(/,/g, ""));
            default:
                return a.id.localeCompare(b.id);
        }
    });

    const totalPages = Math.ceil(sortedMotorcycles.length / itemsPerPage);
    const paginatedMotorcycles = sortedMotorcycles.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <>
            <Header />
            <Sidemenu />
            <div className="main-content app-content">
                <div className="container-fluid">
                    <Breadcrumb title="Motorcycles" active="Motorcycles" />
                    <div className="flex flex-wrap justify-between items-center mt-4 mb-4">
                        <div className="border border-black header-element header-search md:!block !hidden my-auto auto-complete-search">
                            <input
                                type="text"
                                className="header-search-bar form-control"
                                id="header-search"
                                placeholder="Search Model"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <a href="javascript:void(0);" className="header-search-icon border-0">
                                <i className="ri-search-line"></i>
                            </a>
                        </div>

                        <select
                            className="border border-gray-300 m-4 rounded bg-white text-gray-700"
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                        >
                            <option value="Default">Default sorting</option>
                            <option value="Popularity">Sort by popularity</option>
                            <option value="Latest">Sort by latest</option>
                            <option value="Low to High">Sort by: price: low to high</option>
                            <option value="High to Low">Sort by: price: high to low</option>
                        </select>

                        <select
                            className="border border-gray-300 rounded bg-white text-gray-700"
                            value={selectedBrand}
                            onChange={(e) => setSelectedBrand(e.target.value)}
                        >
                            <option value="All">All</option>
                            <option value="Honda">Honda</option>
                            <option value="Suzuki">Suzuki</option>
                            <option value="Kawasaki">Kawasaki</option>
                            <option value="Yamaha">Yamaha</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {paginatedMotorcycles.map((motorcycle) => (
                            <div
                                key={motorcycle.id}
                                className="block cursor-pointer"
                                onClick={() => {
                                    navigate(motorcycle.Link);
                                    window.scrollTo({ top: 0 });
                                }}
                            >
                                <div className="border border-gray-300 p-3 rounded shadow-sm hover:shadow-lg transition rounded-lg overflow-hidden">
                                    <img
                                        src={motorcycle.image}
                                        alt={motorcycle.model}
                                        className="w-full h-auto rounded mb-2 transition-transform duration-300 ease-in-out hover:scale-110"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.src = '/placeholder-motorcycle.png';
                                        }}
                                    />
                                    <h3 className="text-lg font-semibold text-gray-800">{motorcycle.model}</h3>
                                    <div className="bg-red-600 text-white rounded-md p-3 mt-1">
                                        <h6 className="font-bold text-white">₱{motorcycle.price}.00</h6>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {loading && (
                        <div className="text-center py-4">
                            Loading motorcycles...
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-4 text-red-600">
                            {error}
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                        <div>
                            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                            {Math.min(currentPage * itemsPerPage, sortedMotorcycles.length)} of{" "}
                            {sortedMotorcycles.length} results
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                className="px-3 py-1 bg-gray-400 text-gray-800 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handlePrevious}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>

                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index}
                                    className={`px-3 py-1 ${
                                        currentPage === index + 1
                                            ? "bg-red-500 text-white"
                                            : "bg-gray-400 text-gray-800"
                                    } rounded`}
                                    onClick={() => {
                                        setCurrentPage(index + 1);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                >
                                    {index + 1}
                                </button>
                            ))}

                            <button
                                className="px-3 py-1 bg-gray-400 text-gray-800 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleNext}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
                <div className="mt-4"></div>
            </div>
        </>
    );
}

export default UserMotorcycles;