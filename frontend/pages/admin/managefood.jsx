import TopBar from "./components/topbar";
export default function ManageFood() {
    return (
        <div className="min-h-screen bg-gray-50">
            <TopBar />
            <div className="p-10">
                <h2 className="text-3xl font-black text-brand-primary uppercase">Manage Food Items</h2>
                <p className="text-gray-400 font-medium">This is where you can manage your food items.</p>
            </div>
        </div>
    );
}