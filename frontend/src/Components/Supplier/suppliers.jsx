import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { FaSync } from "react-icons/fa";

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const [newSupplier, setNewSupplier] = useState({
        supplier_id:"",
        supplier_name: "",
        supplier_contact_no: "",
        supplier_email: "",
        supplier_address: ""
    });
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [showDetail, setShowDetail] = useState(false);

    // Fetch suppliers from API
    const fetchSuppliers = async () => {
        try {
            const response = await fetch("http://localhost:3001/api/manager/view-suppliers");
            const data = await response.json();
            setSuppliers(data);
        } catch (error) {
            console.error("Error fetching suppliers:", error);
            // Fallback to dummy data if API fails
            const dummyData = [
                {
                    id: 1,
                    name: "Zain Malik",
                    email: "zain.malik@example.com",
                    phone: "+92 300 7778889",
                    company: "Tech Supplies Ltd"
                },
                {
                    id: 2,
                    name: "Fatima Noor",
                    email: "fatima.noor@example.com",
                    phone: "+92 321 9990001",
                    company: "Global Imports"
                },
                {
                    id: 3,
                    name: "Hassan Sheikh",
                    email: "hassan.sheikh@example.com",
                    phone: "+92 333 2223334",
                    company: "Sheikh Traders"
                }
            ];
            setSuppliers(dummyData);
        }
    };

    // Use fetchSuppliers in useEffect
    useEffect(() => {
        fetchSuppliers();
    }, []);

    // Validate form
    const validateForm = () => {
        const errors = {};
        
        // Name validation (not empty, max 64 chars)
        if (!newSupplier.supplier_name.trim()) {
            errors.supplier_name = "Name is required";
        } else if (newSupplier.supplier_name.length > 64) {
            errors.supplier_name = "Name must be less than 64 characters";
        }

        // Email validation (required, max 128 chars, valid format)
        if (!newSupplier.supplier_email) {
            errors.supplier_email = "Email is required";
        } else if (newSupplier.supplier_email.length > 128) {
            errors.supplier_email = "Email must be less than 128 characters";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newSupplier.supplier_email)) {
            errors.supplier_email = "Invalid email format";
        }

        // Phone validation (required, exactly 11 digits)
        const phoneNumber = newSupplier.supplier_contact_no.replace(/\D/g, '');
        if (!phoneNumber) {
            errors.supplier_contact_no = "Phone number is required";
        } else if (phoneNumber.length !== 11) {
            errors.supplier_contact_no = "Phone number must be exactly 11 digits";
        }

        // Address validation (required, max 256 chars)
        if (!newSupplier.supplier_address.trim()) {
            errors.supplier_address = "Address is required";
        } else if (newSupplier.supplier_address.length > 256) {
            errors.supplier_address = "Address must be less than 256 characters";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewSupplier((prev) => ({ ...prev, [name]: value }));
        // Clear error for this field when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    // Handle form submission
    const handleAddSupplier = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        try {
            const response = await fetch("http://localhost:3001/api/manager/add-supplier", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...newSupplier,
                    supplier_id: Date.now()
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add supplier');
            }

            const savedSupplier = await response.json();
            setSuppliers((prev) => [...prev, savedSupplier]);
            setNewSupplier({ 
                supplier_name: "", 
                supplier_email: "", 
                supplier_contact_no: "", 
                supplier_address: "" 
            });
            setFormErrors({});
        } catch (error) {
            console.error("Error adding supplier:", error);
            if (error.message.toLowerCase().includes('unique')) {
                if (error.message.toLowerCase().includes('email')) {
                    setFormErrors(prev => ({ 
                        ...prev, 
                        supplier_email: 'This email is already registered' 
                    }));
                }
                if (error.message.toLowerCase().includes('contact')) {
                    setFormErrors(prev => ({ 
                        ...prev, 
                        supplier_contact_no: 'This phone number is already registered' 
                    }));
                }
            }
        }
    };

    // Handle card click to show detailed view
    const handleCardClick = (supplier) => {
        setSelectedSupplier(supplier);
        setShowDetail(true);
    };

    // Close detailed view
    const handleCloseDetail = () => {
        setSelectedSupplier(null);
        setShowDetail(false);
    };

    const handleRefresh = async () => {
        try {
            await fetchSuppliers();
        } catch (error) {
            console.error("Error refreshing suppliers:", error);
        }
    };

    return (
        <Section>
            {!showDetail ? (
                <div className="split-container">
                    <div className="add-supplier">
                        <h3>Add New Supplier</h3>
                        <form className="form" onSubmit={handleAddSupplier}>
                            <InputGroup>
                                <input
                                    type="text"
                                    name="supplier_name"
                                    placeholder="Supplier Name"
                                    value={newSupplier.supplier_name}
                                    onChange={handleInputChange}
                                    required
                                    maxLength={64}
                                />
                                {formErrors.supplier_name && 
                                    <ErrorMessage>{formErrors.supplier_name}</ErrorMessage>
                                }
                            </InputGroup>

                            <InputGroup>
                                <input
                                    type="email"
                                    name="supplier_email"
                                    placeholder="Email"
                                    value={newSupplier.supplier_email}
                                    onChange={handleInputChange}
                                    required
                                    maxLength={128}
                                />
                                {formErrors.supplier_email && 
                                    <ErrorMessage>{formErrors.supplier_email}</ErrorMessage>
                                }
                            </InputGroup>

                            <InputGroup>
                                <input
                                    type="text"
                                    name="supplier_contact_no"
                                    placeholder="Phone Number (11 digits)"
                                    value={newSupplier.supplier_contact_no}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                                        handleInputChange({
                                            target: {
                                                name: 'supplier_contact_no',
                                                value
                                            }
                                        });
                                    }}
                                    required
                                />
                                {formErrors.supplier_contact_no && 
                                    <ErrorMessage>{formErrors.supplier_contact_no}</ErrorMessage>
                                }
                            </InputGroup>

                            <InputGroup>
                                <input
                                    type="text"
                                    name="supplier_address"
                                    placeholder="Address"
                                    value={newSupplier.supplier_address}
                                    onChange={handleInputChange}
                                    required
                                    maxLength={256}
                                />
                                {formErrors.supplier_address && 
                                    <ErrorMessage>{formErrors.supplier_address}</ErrorMessage>
                                }
                            </InputGroup>

                            <button type="submit">Add Supplier</button>
                        </form>
                    </div>
                    <div className="suppliers-list">
                        <div className="header">
                            <h2>Suppliers</h2>
                            <RefreshButton onClick={handleRefresh}>
                                <FaSync />
                            </RefreshButton>
                        </div>

                        <div className="grid">
                        
                            {suppliers.map((supplier) => (
                                <div className="card" key={supplier.supplier_id} onClick={() => handleCardClick(supplier)}>
                                    <h3>{supplier.supplier_name}</h3>
                                    <p>Email: {supplier.supplier_email}</p>
                                    <p>Phone: {supplier.supplier_contact_no}</p>
                                    <p>Address: {supplier.supplier_address}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="detail-container">
                    <div className="detail-card">
                        <h2>{selectedSupplier.supplier_name}</h2>
                        <p><strong>ID:</strong> {selectedSupplier.supplier_id}</p>
                        <p><strong>Contact no:</strong> {selectedSupplier.supplier_contact_no}</p>
                        <p><strong>Email:</strong> {selectedSupplier.supplier_email}</p>
                        <p><strong>Phone:</strong> {selectedSupplier.supplier_address}</p>
                        <button onClick={handleCloseDetail}>Close</button>
                    </div>
                </div>
            )}
        </Section>
    );
};

const Section = styled.section`
    padding: 2rem;
    background-color: #121212; /* Matches the dark background in the image */

    .split-container {
        display: flex;
        height: calc(100vh - 4rem); /* Adjust for padding */
        gap: 2rem;
    }

    .add-supplier {
        flex: 1;
        background-color: #1e1e1e; /* Slightly lighter than background */
        padding: 2rem;
        border-radius: 8px;
    }

    .suppliers-list {
        flex: 1;
        background-color: #1e1e1e; /* Slightly lighter than background */
        border-radius: 8px;
        padding: 1rem;
        overflow-y: auto;
    }

    .header {
        margin-bottom: 1rem;
        display:flex;
    }

    h2 {
        margin-bottom: 1rem;
        color: #ffffff;
        font-size: 1.5rem;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr); /* Two columns */
        gap: 1rem;
    }

    .card {
        background-color: #1e1e1e; /* Matches container background */
        padding: 1rem;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        color: #ffffff;
        border: 1px solid #333; /* Subtle border to separate cards */
        cursor: pointer;

        &:hover {
            background-color: #252525; /* Slight hover effect */
        }
    }

    .card h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.1rem;
        color: #ffffff;
    }

    .card p {
        font-size: 0.9rem;
        color: #cccccc;
        margin: 0.2rem 0;
    }

    .add-supplier h3 {
        margin-bottom: 1.5rem;
        font-size: 1.2rem;
        text-align: center;
        color: #ffffff;
    }

    .form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-width: 300px;
        margin: 0 auto;
    }

    .form input {
        padding: 0.75rem;
        border: 1px solid #444;
        border-radius: 4px;
        font-size: 1rem;
        background-color: #2a2a2a;
        color: #ffffff;
        width: 100%;
        box-sizing: border-box;

        &::placeholder {
            color: #888;
        }

        &:focus {
            outline: none;
            border-color: #007bff;
        }
    }

    .form button {
        padding: 0.75rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        background-color: #007bff;
        color: #ffffff;
        font-size: 1rem;

        &:hover {
            background-color: #0056b3;
        }
    }

    .detail-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(100vh - 4rem);
    }

    .detail-card {
        background-color: #1e1e1e;
        padding: 2rem;
        border-radius: 8px;
        width: 70%;
        color: #ffffff;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .detail-card h2 {
        margin-bottom: 1rem;
        font-size: 1.5rem;
    }

    .detail-card p {
        font-size: 1rem;
        color: #cccccc;
    }

    .detail-card button {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        background-color: #007bff;
        color: #ffffff;
        font-size: 1rem;
        width: fit-content;

        &:hover {
            background-color: #0056b3;
        }
    }
`;

const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

const ErrorMessage = styled.span`
    color: #ff4444;
    font-size: 0.8rem;
    margin-top: 0.25rem;
`;

const RefreshButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgb(16, 212, 25);
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0;
    margin-left: 1rem;

    svg {
        font-size: 1.2rem;
        transition: transform 0.3s ease;
    }

    &:hover {
        background-color: rgb(14, 190, 22);
        box-shadow: 0 0 10px rgba(16, 212, 25, 0.3);
        
        svg {
            transform: rotate(180deg);
        }
    }

    &:active {
        transform: scale(0.95);
    }
`;

export default Suppliers;