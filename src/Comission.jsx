import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import axios from "axios";
import instance from "../util/config";

const Commission = () => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    orderCode: "",
    customerName: "",
    saleAmount: "",
  });

  const [salesEntries, setSalesEntries] = useState([]);
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.customerName)
      newErrors.customerName = "Customer name is required";
    if (!formData.saleAmount) newErrors.saleAmount = "Sale amount is required";
    if (!formData.orderCode) newErrors.orderCode = "Order code is required"; // Validate orderCode
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const formatCurrency = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "saleAmount") {
      const numericValue = value.replace(/\D/g, "");
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const updatedFormData = { ...formData };

        if (isEditing && editIndex !== null) {
          await instance.put(`/sales/${editIndex}`, updatedFormData);
          setIsEditing(false);
          setEditIndex(null);
        } else {
          await instance.post("/sales", updatedFormData);
        }
        fetchSalesEntries();
        setFormData({
          date: new Date().toISOString().split("T")[0],
          customerName: "",
          saleAmount: "",
          orderCode: "",
        });
      } catch (error) {
        console.error("Error saving entry:", error);
      }
    }
  };

  const fetchSalesEntries = async () => {
    try {
      const response = await instance.get("/sales");
      setSalesEntries(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching sales entries:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await instance.delete(`/sales/${id}`);
      fetchSalesEntries();
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };
  useEffect(() => {
    fetchSalesEntries();
  }, []);

  const getMonthlyTotal = () => {
    const today = new Date();
    return salesEntries.reduce((sum, entry) => {
      const entryDate = new Date(entry.date);
      if (
        entryDate.getFullYear() === today.getFullYear() &&
        entryDate.getMonth() === today.getMonth()
      ) {
        return sum + parseFloat(entry.saleAmount || 0);
      }
      return sum;
    }, 0);
  };

  const handleEdit = (id) => {
    const entryToEdit = salesEntries.find((entry) => entry._id === id);
    if (entryToEdit) {
      setFormData(entryToEdit);
      setIsEditing(true);
      setEditIndex(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Sales Revenue Management
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {isEditing ? "Edit Sales Entry" : "Add New Sales Entry"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.date ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Code
                </label>
                <input
                  type="text"
                  name="orderCode"
                  value={formData.orderCode || ""}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.orderCode ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.orderCode && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.orderCode}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.customerName ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.customerName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.customerName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sale Amount
                </label>
                <input
                  type="text"
                  name="saleAmount"
                  value={formatCurrency(formData.saleAmount)}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.saleAmount ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.saleAmount && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.saleAmount}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <FaPlus className="w-4 h-4" />
              {isEditing ? "Update Entry" : "Add Entry"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Sales Entries</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Date
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Order Code
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Customer Name
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Sale Amount
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(salesEntries) &&
                  salesEntries.map((entry, index) => (
                    <tr
                      key={index}
                      className="border-t border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {entry.date}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {entry.orderCode}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {entry.customerName}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatCurrency(entry.saleAmount)} VNĐ
                      </td>
                      <td className="px-4 py-3 text-sm space-x-2">
                        <button
                          onClick={() => handleEdit(entry._id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                {salesEntries.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-3 text-sm text-gray-500 text-center"
                    >
                      No sales entries found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div>
              {salesEntries.length > 0 && (
                <>
                  <div className="flex flex-col text-end mt-4">
                    <div className="text-base">
                      <span>Total price sold this month: </span>
                      <span className="text-red-500">
                        {formatCurrency(getMonthlyTotal())} VNĐ
                      </span>
                    </div>
                    <div className="text-base">
                      <span>Total price commission this month: </span>
                      <span className="text-red-500">
                        {formatCurrency((getMonthlyTotal() * 1) / 100)} VNĐ
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Commission;
