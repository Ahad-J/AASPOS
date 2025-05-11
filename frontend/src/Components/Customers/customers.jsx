import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaShoppingBag, FaCalendarAlt, FaToggleOn, FaToggleOff, FaExclamationCircle, FaPlus, FaSearch, FaUserPlus, FaUsers, FaUserSlash } from "react-icons/fa";
import axios from '../../utils/axios';
import { fadeIn, slideIn, pulse } from '../../styles/animations';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('active');
    const [formErrors, setFormErrors] = useState({});
    const [newCustomer, setNewCustomer] = useState({
        costumer_name: "",
        costumer_email: "",
        costumer_contact_no: "",
        costumer_address: "",
        costumer_available: "1"
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const validateForm = () => {
        const errors = {};
        
        // Name validation
        if (!newCustomer.costumer_name.trim()) {
            errors.costumer_name = "Name is required";
        } else if (newCustomer.costumer_name.length > 64) {
            errors.costumer_name = "Name must be less than 64 characters";
        }

        // Email validation
        if (newCustomer.costumer_email) {
            if (newCustomer.costumer_email.length > 128) {
                errors.costumer_email = "Email must be less than 128 characters";
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newCustomer.costumer_email)) {
                errors.costumer_email = "Invalid email format";
            }
        }

        // Phone validation
        const phoneNumber = newCustomer.costumer_contact_no.replace(/\D/g, '');
        if (!phoneNumber) {
            errors.costumer_contact_no = "Phone number is required";
        } else if (phoneNumber.length !== 11) {
            errors.costumer_contact_no = "Phone number must be exactly 11 digits";
        }

        // Address validation
        if (!newCustomer.costumer_address.trim()) {
            errors.costumer_address = "Address is required";
        } else if (newCustomer.costumer_address.length > 256) {
            errors.costumer_address = "Address must be less than 256 characters";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCustomer(prev => ({
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

    const handleAddCustomer = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        try {
            const response = await axios.post('http://localhost:3000/api/manager/add-customer', {
                ...newCustomer,
                // Ensure the field names match exactly with what the backend expects
                costumer_name: newCustomer.costumer_name,
                costumer_email: newCustomer.costumer_email,
                costumer_contact_no: newCustomer.costumer_contact_no,
                costumer_address: newCustomer.costumer_address,
                costumer_available: "1"
            });
            
            if (response.data) {
                await fetchCustomers();
                setNewCustomer({
                    costumer_name: "",
                    costumer_email: "",
                    costumer_contact_no: "",
                    costumer_address: "",
                    costumer_available: "1"
                });
                setFormErrors({});
                setActiveTab('active'); // Switch to active customers tab after adding
            }
        } catch (error) {
            console.error("Error adding customer:", error);
            if (error.response?.status === 404) {
                setError("The API endpoint for adding customers is not available. Please check the server.");
            } else if (error.response?.data?.error) {
                const serverError = error.response.data.error.toLowerCase();
                if (serverError.includes('unique')) {
                    if (serverError.includes('email')) {
                        setFormErrors(prev => ({ 
                            ...prev, 
                            costumer_email: 'This email is already registered' 
                        }));
                    }
                    if (serverError.includes('contact')) {
                        setFormErrors(prev => ({ 
                            ...prev, 
                            costumer_contact_no: 'This phone number is already registered' 
                        }));
                    }
                } else {
                    setError(error.response.data.error || 'Failed to add customer');
                }
            } else {
                setError('Failed to add customer. Please try again.');
            }
        }
    };

    const fetchCustomers = async () => {
        try {
            console.log('Fetching customers...');
            const response = await axios.get('http://localhost:3000/api/manager/view-customers');
            console.log('Customers response:', response.data);
            setCustomers(response.data || []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching customers:", error);
            setError(error.response?.data?.error || 'Failed to fetch customers');
            setLoading(false);
        }
    };

    const toggleCustomerStatus = async (customerId, newStatus) => {
        try {
            await axios.patch(`http://localhost:3000/api/manager/customer/${customerId}/status`, {
                available: newStatus
            });
            fetchCustomers(); // Refresh the list
        } catch (error) {
            console.error("Error updating customer status:", error);
            setError('Failed to update customer status');
        }
    };

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = (
            customer.costumer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.costumer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.costumer_contact_no.includes(searchTerm)
        );
        const matchesTab = activeTab === 'active' ? customer.costumer_available === '1' : customer.costumer_available === '0';
        return matchesSearch && matchesTab;
    });

    if (loading) return <LoadingState>Loading customers...</LoadingState>;
    if (error) return <ErrorState><FaExclamationCircle />{error}</ErrorState>;

    console.log('Filtered customers:', filteredCustomers);

    const renderContent = () => {
        if (activeTab === 'add') {
            return (
                <AddCustomerForm onSubmit={handleAddCustomer}>
                    <InputGroup>
                        <input
                            type="text"
                            name="costumer_name"
                            placeholder="Customer Name"
                            value={newCustomer.costumer_name}
                            onChange={handleInputChange}
                            required
                            maxLength={64}
                        />
                        {formErrors.costumer_name && 
                            <ErrorMessage>{formErrors.costumer_name}</ErrorMessage>
                        }
                    </InputGroup>

                    <InputGroup>
                        <input
                            type="email"
                            name="costumer_email"
                            placeholder="Email"
                            value={newCustomer.costumer_email}
                            onChange={handleInputChange}
                            maxLength={128}
                        />
                        {formErrors.costumer_email && 
                            <ErrorMessage>{formErrors.costumer_email}</ErrorMessage>
                        }
                    </InputGroup>

                    <InputGroup>
                        <input
                            type="text"
                            name="costumer_contact_no"
                            placeholder="Phone Number (11 digits)"
                            value={newCustomer.costumer_contact_no}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                                handleInputChange({
                                    target: {
                                        name: 'costumer_contact_no',
                                        value
                                    }
                                });
                            }}
                            required
                        />
                        {formErrors.costumer_contact_no && 
                            <ErrorMessage>{formErrors.costumer_contact_no}</ErrorMessage>
                        }
                    </InputGroup>

                    <InputGroup>
                        <input
                            type="text"
                            name="costumer_address"
                            placeholder="Address"
                            value={newCustomer.costumer_address}
                            onChange={handleInputChange}
                            required
                            maxLength={256}
                        />
                        {formErrors.costumer_address && 
                            <ErrorMessage>{formErrors.costumer_address}</ErrorMessage>
                        }
                    </InputGroup>

                    <SubmitButton type="submit">Add Customer</SubmitButton>
                </AddCustomerForm>
            );
        }

        return (
            <Grid>
                {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                        <Card key={customer.costumer_id}>
                            <CustomerHeader>
                                <IconCircle>
                                    <FaUser />
                                </IconCircle>
                                <div>
                                    <h3>{customer.costumer_name}</h3>
                                    <CustomerID>{customer.costumer_id}</CustomerID>
                                </div>
                                <StatusToggle onClick={() => toggleCustomerStatus(customer.costumer_id, customer.costumer_available === '1' ? '0' : '1')}>
                                    {customer.costumer_available === '1' ? <FaToggleOn /> : <FaToggleOff />}
                                </StatusToggle>
                            </CustomerHeader>
                            <CustomerInfo>
                                <InfoItem>
                                    <FaEnvelope />
                                    <span>{customer.costumer_email || 'N/A'}</span>
                                </InfoItem>
                                <InfoItem>
                                    <FaPhone />
                                    <span>{customer.costumer_contact_no}</span>
                                </InfoItem>
                                <InfoItem>
                                    <FaMapMarkerAlt />
                                    <span>{customer.costumer_address}</span>
                                </InfoItem>
                                <InfoItem>
                                    <FaCalendarAlt />
                                    <span>Joined: {new Date(customer.costumer_joined_at).toLocaleDateString()}</span>
                                </InfoItem>
                            </CustomerInfo>
                            <Stats>
                                <StatItem>
                                    <FaShoppingBag />
                                    <div>
                                        <h4>{customer.total_bills}</h4>
                                        <p>Total Bills</p>
                                    </div>
                                </StatItem>
                                <StatDivider />
                                <StatItem>
                                    <FaShoppingBag />
                                    <div>
                                        <h4>PKR {customer.total_spent.toLocaleString()}</h4>
                                        <p>Total Spent</p>
                                    </div>
                                </StatItem>
                            </Stats>
                        </Card>
                    ))
                ) : (
                    <NoData>
                        {searchTerm 
                            ? 'No customers found matching your search'
                            : `No ${activeTab} customers found`
                        }
                    </NoData>
                )}
            </Grid>
        );
    };

    const renderTabs = () => (
        <TabContainer>
            <Tab 
                $isActive={activeTab === 'active'} 
                onClick={() => setActiveTab('active')}
            >
                <FaUsers />
                Active Customers
            </Tab>
            <Tab 
                $isActive={activeTab === 'inactive'} 
                onClick={() => setActiveTab('inactive')}
            >
                <FaUserSlash />
                Inactive Customers
            </Tab>
            <Tab 
                $isActive={activeTab === 'add'} 
                onClick={() => setActiveTab('add')}
            >
                <FaUserPlus />
                Add Customer
            </Tab>
        </TabContainer>
    );

    const renderSearchInput = () => (
        <SearchInput>
            <FaSearch />
            <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </SearchInput>
    );

    return (
        <Section>
            <Header>
                <div>
                    <h2>Customers</h2>
                    {renderTabs()}
                </div>
                {activeTab !== 'add' && renderSearchInput()}
            </Header>
            {renderContent()}
        </Section>
    );
};

const Section = styled.section`
    padding: 2rem;
    animation: ${fadeIn} 0.5s ease-out;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
    animation: ${slideIn} 0.5s ease-out;

    h2 {
        color: var(--primary-color);
        margin: 0 0 1rem 0;
        font-size: 2rem;
        font-weight: 600;
        position: relative;

        &:after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 60px;
            height: 3px;
            background: var(--primary-color);
            border-radius: 2px;
        }
    }
`;

const TabContainer = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    background: rgba(33, 33, 33, 0.6);
    padding: 0.5rem;
    border-radius: var(--border-radius);
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;

    &:after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, rgba(16, 212, 25, 0.1), transparent);
        z-index: 0;
        pointer-events: none;
    }
`;

const slideInFromRight = keyframes`
    from {
        transform: translateX(30px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
`;

const slideInFromLeft = keyframes`
    from {
        transform: translateX(-30px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
`;

const bounceScale = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
`;

const Tab = styled.button`
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: var(--border-radius);
    background: ${props => props.$isActive ? 'var(--primary-color)' : 'transparent'};
    color: ${props => props.$isActive ? '#000' : '#fff'};
    font-weight: 500;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    z-index: 1;

    svg {
        font-size: 1.2rem;
        transition: transform 0.3s ease;
    }

    &:before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--primary-color);
        opacity: 0;
        transform: scale(0);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
        z-index: -1;
        border-radius: var(--border-radius);
    }

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(16, 212, 25, 0.2);

        svg {
            transform: scale(1.2);
        }

        &:before {
            opacity: 0.1;
            transform: scale(1);
        }
    }

    &:active:not(:disabled) {
        transform: translateY(1px);
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.6;
    }

    animation: ${props => props.$isActive ? bounceScale : 'none'} 0.3s ease;
`;

const SearchInput = styled.div`
    position: relative;
    width: 300px;

    input {
        padding: 0.75rem 1rem 0.75rem 2.5rem;
        border: 2px solid transparent;
        border-radius: var(--border-radius);
        background: var(--secondary-color);
        color: var(--text-primary);
        font-size: 1rem;
        width: 100%;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        &::placeholder {
            color: var(--text-secondary);
            transition: color 0.3s ease;
        }

        &:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(16, 212, 25, 0.1);

            &::placeholder {
                color: rgba(255, 255, 255, 0.7);
            }

            & + svg {
                color: var(--primary-color);
                transform: scale(1.1);
            }
        }
    }

    svg {
        position: absolute;
        left: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-secondary);
        transition: all 0.3s ease;
        pointer-events: none;
    }
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
    animation: ${fadeIn} 0.5s ease-out;

    & > * {
        animation: ${slideInFromRight} 0.5s ease-out forwards;
        opacity: 0;

        &:nth-child(1) { animation-delay: 0.1s; }
        &:nth-child(2) { animation-delay: 0.2s; }
        &:nth-child(3) { animation-delay: 0.3s; }
        &:nth-child(4) { animation-delay: 0.4s; }
        &:nth-child(5) { animation-delay: 0.5s; }
    }
`;

const Card = styled.div`
    background: var(--secondary-color);
    border-radius: var(--border-radius);
    padding: 1.5rem;
    transition: all var(--transition-speed) ease;
    position: relative;
    overflow: hidden;

    &:before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: var(--primary-color);
        transform: scaleX(0);
        transform-origin: left;
        transition: transform var(--transition-speed) ease;
    }

    &:hover {
        transform: translateY(-5px);
        box-shadow: var(--card-shadow);

        &:before {
            transform: scaleX(1);
        }
    }
`;

const CustomerHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    position: relative;

    h3 {
        color: var(--primary-color);
        margin: 0;
        font-size: 1.2rem;
        font-weight: 600;
    }
`;

const IconCircle = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: rgba(16, 212, 25, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-color);
    font-size: 1.5rem;
    transition: all var(--transition-speed) ease;
    animation: ${pulse} 2s infinite;

    ${Card}:hover & {
        transform: scale(1.1);
        background: var(--primary-color);
        color: #000;
    }
`;

const CustomerID = styled.span`
    color: #666;
    font-size: 0.9rem;
`;

const CustomerInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
`;

const InfoItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #fff;

    svg {
        color: rgb(16, 212, 25);
        font-size: 1.1rem;
    }
`;

const Stats = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const StatItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;

    svg {
        color: rgb(16, 212, 25);
        font-size: 1.2rem;
    }

    div {
        h4 {
            color: rgb(16, 212, 25);
            margin: 0;
            font-size: 1.1rem;
        }

        p {
            color: #666;
            margin: 0;
            font-size: 0.9rem;
        }
    }
`;

const StatDivider = styled.div`
    width: 1px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    margin: 0 1rem;
`;

const NoData = styled.div`
    grid-column: 1 / -1;
    text-align: center;
    color: #666;
    padding: 2rem;
`;

const AddCustomerForm = styled.form`
    max-width: 500px;
    margin: 0 auto;
    padding: 2rem;
    background: #212121;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    input {
        padding: 0.75rem;
        border: 1px solid #333;
        border-radius: 4px;
        background: #2a2a2a;
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
`;

const ErrorMessage = styled.span`
    color: #ff4444;
    font-size: 0.8rem;
    margin-top: 0.25rem;
`;

const SubmitButton = styled.button`
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
`;

const LoadingState = styled.div`
    padding: 2rem;
    text-align: center;
    color: var(--text-secondary);
    animation: ${fadeIn} 0.5s ease-out;

    &:before {
        content: '';
        display: block;
        width: 50px;
        height: 50px;
        border: 3px solid var(--primary-color);
        border-radius: 50%;
        border-top-color: transparent;
        margin: 0 auto 1rem;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
`;

const ErrorState = styled.div`
    padding: 2rem;
    text-align: center;
    color: var(--error-color);
    animation: ${fadeIn} 0.5s ease-out;
    background: rgba(244, 67, 54, 0.1);
    border-radius: var(--border-radius);
    margin: 1rem;

    svg {
        font-size: 2rem;
        margin-bottom: 1rem;
    }
`;

const StatusToggle = styled.button`
    background: none;
    border: none;
    color: var(--primary-color);
    cursor: pointer;
    font-size: 1.5rem;
    margin-left: auto;
    padding: 0;
    display: flex;
    align-items: center;
    transition: all var(--transition-speed) ease;

    &:hover {
        transform: scale(1.1);
        color: var(--primary-dark);
    }

    &:active {
        transform: scale(0.95);
    }
`;

export default Customers;