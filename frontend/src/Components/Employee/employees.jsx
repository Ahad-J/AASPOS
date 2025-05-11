import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard, FaMoneyBillWave, FaBriefcase, FaToggleOn, FaToggleOff, FaTimes, FaSearch, FaShoppingBag } from "react-icons/fa";
import axios from '../../utils/axios';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [newEmployee, setNewEmployee] = useState({
        employee_name: "",
        employee_email: "",
        employee_contact_no: "",
        employee_cnic: "",
        employee_salary: "",
        employee_designation: "",
        employee_address: "",
        employee_available: "1"
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/manager/view-employees');
            setEmployees(response.data.data || []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching employees:", error);
            setError(error.response?.data?.error || 'Failed to fetch employees');
            setLoading(false);
        }
    };

    const validateForm = () => {
        const errors = {};
        
        // Name validation (not empty, max 64 chars)
        if (!newEmployee.employee_name.trim()) {
            errors.employee_name = "Name is required";
        } else if (newEmployee.employee_name.length > 64) {
            errors.employee_name = "Name must be less than 64 characters";
        }

        // Email validation (optional, max 128 chars, valid format)
        if (newEmployee.employee_email) {
            if (newEmployee.employee_email.length > 128) {
                errors.employee_email = "Email must be less than 128 characters";
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmployee.employee_email)) {
                errors.employee_email = "Invalid email format";
            }
        }

        // Phone validation (exactly 11 chars)
        const phoneNumber = newEmployee.employee_contact_no.replace(/\D/g, ''); // Remove non-digits
        if (!phoneNumber) {
            errors.employee_contact_no = "Phone number is required";
        } else if (phoneNumber.length !== 11) {
            errors.employee_contact_no = "Phone number must be exactly 11 digits";
        }

        // CNIC validation (13 digits)
        if (!newEmployee.employee_cnic) {
            errors.employee_cnic = "CNIC is required";
        } else {
            const cnicNum = newEmployee.employee_cnic.replace(/\D/g, ''); // Remove non-digits
            if (cnicNum.length !== 13) {
                errors.employee_cnic = "CNIC must be exactly 13 digits";
            }
        }

        // Salary validation (positive smallmoney)
        if (!newEmployee.employee_salary) {
            errors.employee_salary = "Salary is required";
        } else if (isNaN(newEmployee.employee_salary) || Number(newEmployee.employee_salary) <= 0) {
            errors.employee_salary = "Salary must be a positive number";
        }

        // Designation validation (not empty, max 64 chars)
        if (!newEmployee.employee_designation.trim()) {
            errors.employee_designation = "Designation is required";
        } else if (newEmployee.employee_designation.length > 64) {
            errors.employee_designation = "Designation must be less than 64 characters";
        }

        // Address validation (not empty, max 256 chars)
        if (!newEmployee.employee_address.trim()) {
            errors.employee_address = "Address is required";
        } else if (newEmployee.employee_address.length > 256) {
            errors.employee_address = "Address must be less than 256 characters";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEmployee(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        try {
            console.log('Sending employee data:', newEmployee);
            await axios.post('http://localhost:3000/api/manager/add-employee', newEmployee);
            fetchEmployees();
            setNewEmployee({
                employee_name: "",
                employee_email: "",
                employee_contact_no: "",
                employee_cnic: "",
                employee_salary: "",
                employee_designation: "",
                employee_address: "",
                employee_available: "1"
            });
            setFormErrors({});
        } catch (error) {
            console.error("Error adding employee:", error);
            console.error("Server response:", error.response?.data);
            
            if (error.response?.data?.error) {
                const serverError = error.response.data.error.toLowerCase();
                
                // Check for unique constraint violations
                if (serverError.includes('unique')) {
                    if (serverError.includes('cnic')) {
                        setFormErrors(prev => ({ 
                            ...prev, 
                            employee_cnic: 'This CNIC is already registered with another employee' 
                        }));
                    } else if (serverError.includes('employee_email')) {
                        setFormErrors(prev => ({ 
                            ...prev, 
                            employee_email: 'This email is already registered' 
                        }));
                    } else if (serverError.includes('employee_contact_no')) {
                        setFormErrors(prev => ({ 
                            ...prev, 
                            employee_contact_no: 'This phone number is already registered' 
                        }));
                    }
                } else {
                    setError('Failed to add employee. Please try again.');
                }
            } else {
                setError('Failed to add employee. Please try again.');
            }
        }
    };

    const toggleEmployeeStatus = async (employeeId, newStatus) => {
        try {
            await axios.patch(`/api/manager/employee/${employeeId}/status`, {
                available: newStatus
            });
            fetchEmployees();
        } catch (error) {
            console.error("Error updating employee status:", error);
        }
    };

    const filteredEmployees = employees.filter(employee =>
        employee.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employee_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employee_contact_no.includes(searchTerm)
    );

    if (loading) return <div>Loading employees...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <Section>
            <div className="split-container">
                <div className="add-employee">
                    <h3>Add New Employee</h3>
                    <form className="form" onSubmit={handleAddEmployee}>
                        <InputGroup>
                        <input
                            type="text"
                                name="employee_name"
                            placeholder="Employee Name"
                                value={newEmployee.employee_name}
                            onChange={handleInputChange}
                            required
                                maxLength={64}
                        />
                            {formErrors.employee_name && <ErrorMessage>{formErrors.employee_name}</ErrorMessage>}
                        </InputGroup>

                        <InputGroup>
                        <input
                            type="email"
                                name="employee_email"
                            placeholder="Email"
                                value={newEmployee.employee_email}
                                onChange={handleInputChange}
                                maxLength={128}
                            />
                            {formErrors.employee_email && <ErrorMessage>{formErrors.employee_email}</ErrorMessage>}
                        </InputGroup>

                        <InputGroup>
                            <input
                                type="text"
                                inputMode="numeric"
                                name="employee_contact_no"
                                placeholder="Phone Number (11 digits)"
                                value={newEmployee.employee_contact_no}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                                    handleInputChange({
                                        target: {
                                            name: 'employee_contact_no',
                                            value
                                        }
                                    });
                                }}
                                required
                            />
                            {formErrors.employee_contact_no && <ErrorMessage>{formErrors.employee_contact_no}</ErrorMessage>}
                        </InputGroup>

                        <InputGroup>
                            <input
                                type="text"
                                name="employee_cnic"
                                placeholder="CNIC (13 digits)"
                                value={newEmployee.employee_cnic}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 13);
                                    handleInputChange({
                                        target: {
                                            name: 'employee_cnic',
                                            value
                                        }
                                    });
                                }}
                                required
                            />
                            {formErrors.employee_cnic && <ErrorMessage>{formErrors.employee_cnic}</ErrorMessage>}
                        </InputGroup>

                        <InputGroup>
                            <input
                                type="number"
                                name="employee_salary"
                                placeholder="Salary"
                                value={newEmployee.employee_salary}
                            onChange={handleInputChange}
                            required
                                min="1"
                                step="0.01"
                        />
                            {formErrors.employee_salary && <ErrorMessage>{formErrors.employee_salary}</ErrorMessage>}
                        </InputGroup>

                        <InputGroup>
                        <input
                                type="text"
                                name="employee_designation"
                                placeholder="Designation"
                                value={newEmployee.employee_designation}
                            onChange={handleInputChange}
                            required
                                maxLength={64}
                        />
                            {formErrors.employee_designation && <ErrorMessage>{formErrors.employee_designation}</ErrorMessage>}
                        </InputGroup>

                        <InputGroup>
                        <input
                            type="text"
                                name="employee_address"
                                placeholder="Address"
                                value={newEmployee.employee_address}
                            onChange={handleInputChange}
                            required
                                maxLength={256}
                        />
                            {formErrors.employee_address && <ErrorMessage>{formErrors.employee_address}</ErrorMessage>}
                        </InputGroup>

                        <button type="submit">Add Employee</button>
                    </form>
                </div>
                <div className="employees-list">
                    <div className="header">
                        <h2>Employees</h2>
                        <SearchInput>
                            <FaSearch />
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </SearchInput>
                    </div>
                    <div className="grid">
                        {filteredEmployees.map((employee) => (
                            <Card key={employee.employee_id} onClick={() => setSelectedEmployee(employee)}>
                                <CardHeader>
                                    <IconCircle>
                                        <FaUser />
                                    </IconCircle>
                                    <div>
                                        <h3>{employee.employee_name}</h3>
                                        <span>{employee.employee_designation}</span>
                            </div>
                                    <StatusToggle 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleEmployeeStatus(
                                                employee.employee_id, 
                                                employee.employee_available === '1' ? '0' : '1'
                                            );
                                        }}
                                    >
                                        {employee.employee_available === '1' ? <FaToggleOn /> : <FaToggleOff />}
                                    </StatusToggle>
                                </CardHeader>
                                <CardInfo>
                                    <InfoItem>
                                        <FaEnvelope />
                                        <span>{employee.employee_email}</span>
                                    </InfoItem>
                                    <InfoItem>
                                        <FaPhone />
                                        <span>{employee.employee_contact_no}</span>
                                    </InfoItem>
                                </CardInfo>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {selectedEmployee && (
                <Modal>
                    <ModalContent>
                        <ModalHeader>
                            <h2>Employee Details</h2>
                            <CloseButton onClick={() => setSelectedEmployee(null)}>
                                <FaTimes />
                            </CloseButton>
                        </ModalHeader>
                        <ModalBody>
                            <DetailSection>
                                <h3>Personal Information</h3>
                                <DetailItem>
                                    <FaUser />
                                    <div>
                                        <label>Name</label>
                                        <span>{selectedEmployee.employee_name}</span>
                                    </div>
                                </DetailItem>
                                <DetailItem>
                                    <FaIdCard />
                                    <div>
                                        <label>CNIC</label>
                                        <span>{selectedEmployee.employee_cnic}</span>
                                    </div>
                                </DetailItem>
                                <DetailItem>
                                    <FaEnvelope />
                                    <div>
                                        <label>Email</label>
                                        <span>{selectedEmployee.employee_email}</span>
                                    </div>
                                </DetailItem>
                                <DetailItem>
                                    <FaPhone />
                                    <div>
                                        <label>Phone</label>
                                        <span>{selectedEmployee.employee_contact_no}</span>
                                    </div>
                                </DetailItem>
                                <DetailItem>
                                    <FaMapMarkerAlt />
                                    <div>
                                        <label>Address</label>
                                        <span>{selectedEmployee.employee_address}</span>
                                    </div>
                                </DetailItem>
                            </DetailSection>
                            <DetailSection>
                                <h3>Employment Information</h3>
                                <DetailItem>
                                    <FaBriefcase />
                                    <div>
                                        <label>Designation</label>
                                        <span>{selectedEmployee.employee_designation}</span>
                                    </div>
                                </DetailItem>
                                <DetailItem>
                                    <FaMoneyBillWave />
                                    <div>
                                        <label>Salary</label>
                                        <span>PKR {selectedEmployee.employee_salary}</span>
                                    </div>
                                </DetailItem>
                                <DetailItem>
                                    <FaToggleOn />
                                    <div>
                                        <label>Status</label>
                                        <span>{selectedEmployee.employee_available === '1' ? 'Active' : 'Inactive'}</span>
                                    </div>
                                </DetailItem>
                            </DetailSection>
                            {selectedEmployee.total_sales && (
                                <DetailSection>
                                    <h3>Performance</h3>
                                    <DetailItem>
                                        <FaShoppingBag />
                                        <div>
                                            <label>Total Bills Processed</label>
                                            <span>{selectedEmployee.total_sales}</span>
                                        </div>
                                    </DetailItem>
                                </DetailSection>
                            )}
                        </ModalBody>
                    </ModalContent>
                </Modal>
            )}
        </Section>
    );
};

const Section = styled.section`
    padding: 2rem;
    background-color: #121212;

    .split-container {
        display: flex;
        gap: 2rem;
        height: calc(100vh - 4rem);
    }

    .add-employee {
        flex: 1;
        background-color: #1e1e1e;
        padding: 2rem;
        border-radius: 8px;
        max-width: 400px;
    }

    .employees-list {
        flex: 2;
        background-color: #1e1e1e;
        border-radius: 8px;
        padding: 1.5rem;
        overflow-y: auto;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;

        h2 {
            color: rgb(16, 212, 25);
            margin: 0;
        }
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 1.5rem;
    }

    h3 {
        color: rgb(16, 212, 25);
        margin-bottom: 1.5rem;
        text-align: center;
    }

    .form {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        input {
            padding: 0.75rem;
            border: 1px solid #333;
            border-radius: 4px;
            background: #212121;
            color: #fff;
            font-size: 1rem;

            &::placeholder {
                color: #666;
    }

            &:focus {
                outline: none;
                border-color: rgb(16, 212, 25);
            }
        }

        button {
        padding: 0.75rem;
            border: none;
        border-radius: 4px;
            background: rgb(16, 212, 25);
            color: #000;
            font-size: 1rem;
            cursor: pointer;
            transition: opacity 0.3s ease;

            &:hover {
                opacity: 0.9;
            }
        }
    }
`;

const SearchInput = styled.div`
    display: flex;
    align-items: center;
    background: #212121;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    width: 300px;

    svg {
        color: rgb(16, 212, 25);
        margin-right: 0.5rem;
    }

    input {
        background: none;
        border: none;
        color: #fff;
        font-size: 1rem;
        width: 100%;

        &::placeholder {
            color: #666;
        }

        &:focus {
            outline: none;
        }
    }
`;

const Card = styled.div`
    background: #212121;
    border-radius: 8px;
    padding: 1.5rem;
    cursor: pointer;
    transition: transform 0.3s ease;

    &:hover {
        transform: translateY(-5px);
    }
`;

const CardHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;

    h3 {
        margin: 0;
        color: #fff;
        font-size: 1.1rem;
    }

    span {
        color: #666;
        font-size: 0.9rem;
    }
`;

const IconCircle = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(16, 212, 25, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgb(16, 212, 25);
`;

const CardInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const InfoItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #fff;

    svg {
        color: rgb(16, 212, 25);
        font-size: 0.9rem;
        }

    span {
        font-size: 0.9rem;
    }
`;

const StatusToggle = styled.button`
    background: none;
    border: none;
    color: rgb(16, 212, 25);
    cursor: pointer;
    font-size: 1.5rem;
    margin-left: auto;
    padding: 0;
    display: flex;
    align-items: center;
    transition: opacity 0.3s ease;

    &:hover {
        opacity: 0.8;
    }
`;

const Modal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background: #1e1e1e;
    border-radius: 8px;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #333;

    h2 {
        margin: 0;
        color: rgb(16, 212, 25);
    }
`;

const CloseButton = styled.button`
    background: none;
        border: none;
    color: #fff;
        cursor: pointer;
    font-size: 1.5rem;
    padding: 0;
    display: flex;
    align-items: center;
    transition: opacity 0.3s ease;

        &:hover {
        opacity: 0.8;
    }
`;

const ModalBody = styled.div`
    padding: 1.5rem;
`;

const DetailSection = styled.div`
    margin-bottom: 2rem;

    h3 {
        color: rgb(16, 212, 25);
        margin: 0 0 1rem 0;
        text-align: left;
    }
`;

const DetailItem = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    color: #fff;

    svg {
        color: rgb(16, 212, 25);
        font-size: 1.2rem;
    }

    div {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        label {
            color: #666;
            font-size: 0.9rem;
        }

        span {
            font-size: 1rem;
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

export default Employees;