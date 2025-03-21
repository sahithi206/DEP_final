import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../utils/Sidebar";
import HomeNavbar from "../../../utils/HomeNavbar";
import { AuthContext } from "../../Context/Authcontext";
const url = import.meta.env.VITE_REACT_APP_URL;

const SEForm = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);;
    const navigate = useNavigate();
    const [user, setUser] = useState();
    const { getuser } = useContext(AuthContext);
    const [yearlyBudget, setYearly] = useState([]);
    const [budgetSanctioned, setSanctioned] = useState({});
    const [budget, setBudget] = useState([]);
    const [manpower, setManpower] = useState([]);
    const [consumables, setConsumables] = useState([]);
    const [total, setTotal] = useState([]);
    const [totalExp,setExp]=useState({});
    const [balance,setBalance]=useState({});
    const [others, setOthers] = useState([]);
    const [equipment, setEquipment] = useState([]);

    const [data, setData] = useState({
        name:"",
        projectId: "",
        endDate: "",
        startDate: "",
        institute: "",
        title: "",
        scheme: "",
        currentYear: "",
        TotalCost: 0
    });
    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { getProject } = useContext(AuthContext);
    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                const json = await getProject(id);
                const info = json?.data || {};
                console.log(info);
    
                setData(prevData => ({
                    ...prevData,
                    projectId: info.project?._id || "",
                    institute: info.generalInfo?.instituteName || "NA",
                    name: info.generalInfo?.name || "NA",
                    title: info.project?.Title || "NA",
                    scheme: info.project?.Scheme || "NA",
                    currentYear: info.project?.currentYear || "NA",
                    TotalCost: info.project?.TotalCost || 0,
                }));
                if(info.project?.budgetTotal){
                    setSanctioned({
                        "human_resources":info.project.budgetTotal?.recurring?.human_resources,
                        "consumables":info.project.budgetTotal?.recurring?.consumables,
                        "others":info.project.budgetTotal?.recurring?.others,
                        "nonRecurring":info.project.budgetTotal?.nonRecurring,
                        "total":info.project.budgetTotal?.total
                    });

                }
                setYearly(info.yearlySanct || []);
                setBudget(info.yearlyExp || []);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
    
        fetchProjectDetails();
    }, [id]);
    
    useEffect(() => {
        if (!budget || !budgetSanctioned) return;
    
        let manpowerExp = 0, consumablesExp = 0, othersExp = 0, equipmentExp = 0, totalExp = 0;
        let manpowerArray = [], consumablesArray = [], othersArray = [], equipmentArray = [], totalArray = [];
    
        budget.forEach(val => {
            if (val?.recurring?.human_resources !== undefined) {
                manpowerExp += val.recurring.human_resources;
                manpowerArray.push(val.recurring.human_resources);
            }
            if (val?.recurring?.consumables !== undefined) {
                consumablesExp += val.recurring.consumables;
                consumablesArray.push(val.recurring.consumables);
            }
            if (val?.recurring?.others !== undefined) {
                othersExp += val.recurring.others;
                othersArray.push(val.recurring.others);
            }
            if (val?.nonRecurring !== undefined) {
                equipmentExp += val.nonRecurring;
                equipmentArray.push(val.nonRecurring);
            }
            if (val?.yearTotal !== undefined) {
                totalExp += val.yearTotal;
                totalArray.push(val.yearTotal);
            }
        });
    
        setManpower(manpowerArray);
        setConsumables(consumablesArray);
        setOthers(othersArray);
        setEquipment(equipmentArray);
        setTotal(totalArray);
        
        setExp({
            human_resources: manpowerExp,
            consumables: consumablesExp,
            others: othersExp,
            nonRecurring: equipmentExp,
            total: totalExp
          });
          
        
          setBalance({
            human_resources: (budgetSanctioned?.human_resources || 0) - manpowerExp,
            consumables: (budgetSanctioned?.consumables || 0) - consumablesExp,
            others: (budgetSanctioned?.others || 0) - othersExp,
            nonRecurring: (budgetSanctioned?.nonRecurring || 0) - equipmentExp,
            total: data.TotalCost - totalExp
          });
          
    
    }, [budget]);
    

    console.log(budget);
    console.log("Manpower", manpower);
    const handleChange = (e) => {
        setData((prevData) => ({ ...prevData, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Authentication required.");
            return;
        }
        try {
            const response = await fetch(`${url}projects/se`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": ` ${token}`,
                },
                body: JSON.stringify({ data:data,yearlyBudget:yearlyBudget,
                    budgetSanctioned:budgetSanctioned,
                    manpower:manpower,consumables:consumables,
                    others:others,equipment:equipment,
                    total:total,totalExp:totalExp,balance:balance }),
            });

            if (!response.ok) throw new Error("Submission failed");

            const json = await response.json();
            if (json.success) { alert("Data submitted successfully!"); }
            else { alert("Error in Submitting form"); }
            navigate(`/project-dashboard/${id}`)
        } catch (error) {
            console.error("Error:", error);
            alert("Error in submitting data!");
        }
    };

    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <HomeNavbar isSidebarOpen={isSidebarOpen} path={`/project-dashboard/${id}`} />
                <div className="p-6 space-y-6 mt-16">
                    <div className="bg-white shadow-md rounded-xl p-6 text-center border-l-8 border-blue-700 hover:shadow-xl transition-shadow">
                        <h1 className="text-3xl font-black text-gray-900 mb-2">ResearchX</h1>
                        <p className="mt-3 text-2xl font-bold text-blue-800">Request for Annual Installment with Up-to-Date Statement of Expenditure</p>
                    </div>

                    <div className="bg-white shadow-md rounded-lg p-6 mt-6 border-t-4 border-blue-800">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <label className="font-semibold text-gray-700">File Number</label>
                            <span className="px-3 py-1 w-full">: {data.projectId}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <label className="font-semibold text-gray-700">Name of the grant receiving Organization</label>
                            <span className="px-3 py-1 w-full">: {data.institute}</span>
                            <label className="font-semibold text-gray-700">Name of Principal Investigator:</label>
                            <span className="px-3 py-1 w-full">: {data.name}</span>
                            <label className="font-semibold text-gray-700">Name of the Scheme</label>
                            <span className="px-3 py-1 w-full">: {data.scheme}</span>
                            <label className="font-semibold text-gray-700">Present Year of Project</label>
                            <span className="px-3 py-1 w-full">: {data.currentYear}</span>
                            <label className="font-semibold text-gray-700">Start Date of Year</label>
                            <input
                                type="date"
                                name="startDate"
                                value={data.startDate}
                                onChange={handleChange}
                                required
                                className="border border-gray-400 rounded px-3 py-1 w-full"
                            />
                            <label className="font-semibold text-gray-700">End Date of Year</label>
                            <input
                                type="date"
                                name="endDate"
                                value={data.endDate}
                                onChange={handleChange}
                                required
                                className="border border-gray-400 rounded px-3 py-1 w-full"
                            />
                        </div>

                        <label className="font-semibold text-gray-700">Grant Received in Each Year:</label>
                        <ul className="list-disc pl-6 ">
                            {yearlyBudget && yearlyBudget.map((sanct, index) => (
                                <li key={index} className="px-3 py-1 text-gray-700 font-bold w-full">
                                    <span>Year {index + 1}: {sanct}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mb-4">
                            <div className="overflow-x-auto">
                                <table className="w-full border border-gray-300 rounded-lg">
                                    <thead>
                                        <tr className="bg-blue-100 text-gray-700">
                                            <th className="border border-gray-400 px-4 py-2" >Sanctioned Heads</th>
                                            <th className="border border-gray-400 px-4 py-2" >Total Funds Sanctioned</th>
                                            <th className="border border-gray-400 px-4 py-2" colSpan={manpower && manpower.length > 0 ? manpower.length : 1}>Expenditure Incurred</th>
                                            <th className="border border-gray-400 px-4 py-2">Total Expenditure</th>
                                            <th className="border border-gray-400 px-4 py-2">Balance against Sanctioned</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    <tr className="text-center">
                                            <th className="border border-gray-400 px-4 py-2" >1</th>
                                            <th className="border border-gray-400 px-4 py-2" >2</th>
                                            {total && total.length > 0 ? (
                                                total.map((man, index) => (
                                                    <th className="border border-gray-400 px-4 py-2" key={index}>
                                                       Year {index+1}
                                                    </th>
                                                ))
                                            ) : (
                                                <th className="border border-gray-400 px-4 py-2">Year 1</th>
                                            )} <th className="border border-gray-400 px-4 py-2">3</th>
                                            <th className="border border-gray-400 px-4 py-2">4</th>
                                        </tr>
                                        <tr className="text-center">
                                            <th className="border border-gray-400 px-4 py-2" >Manpower</th>
                                            <th className="border border-gray-400 px-4 py-2" >{budgetSanctioned?.human_resources || 0}</th>
                                            {manpower && manpower.length > 0 ? (
                                                manpower.map((man, index) => (
                                                    <th className="border border-gray-400 px-4 py-2" key={index}>
                                                        {man}
                                                    </th>
                                                ))
                                            ) : (
                                                <th className="border border-gray-400 px-4 py-2">0</th>
                                            )}

                                            <th className="border border-gray-400 px-4 py-2">{totalExp?.human_resources||0}</th>
                                            <th className="border border-gray-400 px-4 py-2">{balance?.human_resources||0}</th>
                                        </tr>
                                        <tr className="text-center">
                                            <th className="border border-gray-400 px-4 py-2" >Consumables</th>
                                            <th className="border border-gray-400 px-4 py-2" >{budgetSanctioned?.consumables || 0}</th>
                                            {consumables && consumables.length > 0 ? (
                                                consumables.map((man, index) => (
                                                    <th className="border border-gray-400 px-4 py-2" key={index}>
                                                        {man}
                                                    </th>
                                                ))
                                            ) : (
                                                <th className="border border-gray-400 px-4 py-2">0</th>
                                            )}

                                            <th className="border border-gray-400 px-4 py-2">{totalExp?.consumables||0}</th>
                                            <th className="border border-gray-400 px-4 py-2">{balance?.consumables||0}</th>
                                        </tr>
                                        <tr className="text-center">
                                            <th className="border border-gray-400 px-4 py-2" >Others</th>
                                            <th className="border border-gray-400 px-4 py-2" >{budgetSanctioned?.others || 0}</th>
                                            {others && others.length > 0 ? (
                                                others.map((man, index) => (
                                                    <th className="border border-gray-400 px-4 py-2" key={index}>
                                                        {man}
                                                    </th>
                                                ))
                                            ) : (
                                                <th className="border border-gray-400 px-4 py-2">0</th>
                                            )}

                                            <th className="border border-gray-400 px-4 py-2">{totalExp?.others||0}</th>
                                            <th className="border border-gray-400 px-4 py-2">{balance?.others||0}</th>
                                        </tr>
                                        <tr className="text-center">
                                            <th className="border border-gray-400 px-4 py-2" >Equipment</th>
                                            <th className="border border-gray-400 px-4 py-2" >{budgetSanctioned?.nonRecurring || 0}</th>
                                            {equipment && equipment.length > 0 ? (
                                                equipment.map((man, index) => (
                                                    <th className="border border-gray-400 px-4 py-2" key={index}>
                                                        {man}
                                                    </th>
                                                ))
                                            ) : (
                                                <th className="border border-gray-400 px-4 py-2">0</th>
                                            )}

                                            <th className="border border-gray-400 px-4 py-2">{totalExp?.nonRecurring||0}</th>
                                            <th className="border border-gray-400 px-4 py-2">{balance?.nonRecurring||0}</th>

                                        </tr>
                                        <tr className="text-center">
                                            <th className="border border-gray-400 px-4 py-2" >Total</th>
                                            <th className="border border-gray-400 px-4 py-2" >{budgetSanctioned?.total}</th>
                                            {total && total.length > 0 ? (
                                                total.map((man, index) => (
                                                    <th className="border border-gray-400 px-4 py-2" key={index}>
                                                        {man}
                                                    </th>
                                                ))
                                            ) : (
                                                <th className="border border-gray-400 px-4 py-2">0</th>
                                            )} <th className="border border-gray-400 px-4 py-2">{totalExp?.total||0}</th>
                                            <th className="border border-gray-400 px-4 py-2">{balance?.total||0}</th>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mb-4 text-center py-4">
                            <button
                                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg w-full hover:bg-blue-700 transition-all duration-200 shadow-md"
                                onClick={handleSubmit}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SEForm;