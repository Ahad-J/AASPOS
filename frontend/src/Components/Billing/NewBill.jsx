import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const NewBill = () => {
    const [activeBillId, setActiveBillId] = useState(null);
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tax, setTax] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [subtotal, setSubtotal] = useState(0);
    const [total, setTotal] = useState(0);
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState('');

    // Calculate totals whenever cart, tax, or discount changes
    useEffect(() => {
        const newSubtotal = cart.reduce((sum, item) => sum + (item.quantity * item.product_sale_price), 0);
        const taxAmount = (newSubtotal * tax) / 100;
        const discountAmount = (newSubtotal * discount) / 100;
        const newTotal = newSubtotal + taxAmount - discountAmount;
        
        setSubtotal(newSubtotal);
        setTotal(newTotal);
    }, [cart, tax, discount]);

    // Fetch available products when component mounts
    useEffect(() => {
        fetchProducts();
        fetchCustomers();
    }, []);

    // Fetch customers
    const fetchCustomers = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/manager/view-customers');
            if (response.data) {
                // Filter only active customers (costumer_available === '1')
                const activeCustomers = response.data.filter(customer => customer.costumer_available === '1');
                setCustomers(activeCustomers);
            }
        } catch (err) {
            setError('Failed to fetch customers');
            console.error(err);
        }
    };

    // Fetch available products
    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/billing/products');
            if (response.data && response.data.products) {
                setProducts(response.data.products);
            } else {
                throw new Error('Invalid product data format');
            }
        } catch (err) {
            setError('Failed to fetch products');
            console.error(err);
        }
    };

    // Initialize new bill
    const handleInitializeBill = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Get employee ID from localStorage
            const employeeId = localStorage.getItem('employeeId');
            if (!employeeId) {
                throw new Error('No employee ID found. Please log in again.');
            }

            console.log('Initializing bill with cashier:', employeeId, 'and customer:', selectedCustomer || 'null');

            // First, initialize the bill
            const response = await axios.post('http://localhost:3000/api/billing/initialize', {
                cashier_id: employeeId
            });
            
            if (response.data && response.data.bill_id) {
                const billId = response.data.bill_id;
                console.log('Bill initialized:', response.data);

                // Then, update the bill with the customer ID
                await axios.post('http://localhost:3000/api/billing/update-bill', {
                    bill_id: billId,
                    bill_costumer: selectedCustomer || null
                });

                setActiveBillId(billId);
                await fetchProducts(); // Refresh products after initializing bill
            } else {
                throw new Error('Invalid response format from server');
            }
        } catch (err) {
            console.error('Bill initialization error:', err);
            setError(err.response?.data?.error || err.message || 'Failed to initialize bill');
        } finally {
            setLoading(false);
        }
    };

    // Add product to cart
    const handleProductClick = (product) => {
        if (!activeBillId) {
            setError('Please initialize a bill first');
            return;
        }

        const existingItem = cart.find(item => item.product_id === product.product_id);
        if (existingItem) {
            // Check if adding one more would exceed available quantity
            if (existingItem.quantity + 1 > product.product_quantity) {
                setError(`Only ${product.product_quantity} units available`);
                return;
            }
            // Increment quantity if product already in cart
            setCart(cart.map(item =>
                item.product_id === product.product_id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            // Add new product to cart
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    // Remove product from cart
    const handleRemoveFromCart = (productId) => {
        setCart(cart.filter(item => item.product_id !== productId));
    };

    // Handle proceed with bill
    const handleProceed = async () => {
        try {
            setLoading(true);
            setError(null);

            // Add all products to bill
            for (const item of cart) {
                await axios.post('http://localhost:3000/api/billing/add-product', {
                    bill_id: activeBillId,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price: item.product_sale_price
                });
            }

            // Update bill with customer if needed
            if (selectedCustomer !== '') {
                const updateData = {
                    bill_id: activeBillId,
                    bill_costumer: selectedCustomer
                };
                console.log('Sending update-bill request with data:', JSON.stringify(updateData, null, 2));

                const updateResponse = await axios.post('http://localhost:3000/api/billing/update-bill', updateData);
                console.log('Update bill response:', updateResponse.data);
            }

            // Complete the bill
            const completeResponse = await axios.post('http://localhost:3000/api/billing/complete', {
                bill_id: activeBillId,
                tax_percentage: tax ? Number(tax) : 0,
                discount_percentage: discount ? Number(discount) : 0
            });
            console.log('Complete bill response:', completeResponse.data);

            // Reset state
            setActiveBillId(null);
            setCart([]);
            setTax(0);
            setDiscount(0);
            setSelectedCustomer('');
            await fetchProducts();
        } catch (err) {
            console.error('Bill processing error:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                details: err
            });
            if (err.response) {
                console.error('Error response:', {
                    data: err.response.data,
                    status: err.response.status,
                    headers: err.response.headers
                });
            }
            setError(err.response?.data?.error || 'Failed to process bill');
        } finally {
            setLoading(false);
        }
    };

    // Handle cancel bill
    const handleCancel = async () => {
        try {
            setLoading(true);
            setError(null);

            await axios.post('http://localhost:3000/api/billing/cancel', {
                bill_id: activeBillId
            });

            setActiveBillId(null);
            setCart([]);
            await fetchProducts(); // Refresh products after canceling bill
        } catch (err) {
            console.error('Bill cancellation error:', err);
            setError(err.response?.data?.error || 'Failed to cancel bill');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            
            <InitializeSection>
                <CustomerSelect
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    disabled={activeBillId}
                >
                    <option value="">No Customer</option>
                    {customers.map(customer => (
                        <option key={customer.costumer_id} value={customer.costumer_id}>
                            {customer.costumer_name} - {customer.costumer_contact_no}
                        </option>
                    ))}
                </CustomerSelect>

                {!activeBillId ? (
                    <Button onClick={handleInitializeBill} disabled={loading}>
                        {loading ? 'Initializing...' : 'Initialize New Bill'}
                    </Button>
                ) : (
                    <BillInfo>
                        Active Bill ID: {activeBillId}
                        <br />
                        Customer: {selectedCustomer ? 
                            customers.find(c => c.costumer_id === selectedCustomer)?.costumer_name 
                            : 'No Customer'}
                    </BillInfo>
                )}
            </InitializeSection>

            <MainContent>
                <ProductsGrid>
                    {products.map(product => (
                        <ProductCard 
                            key={product.product_id}
                            onClick={() => handleProductClick(product)}
                            disabled={!activeBillId || loading}
                        >
                            <h3>{product.product_name}</h3>
                            <p>Price: ${product.product_sale_price}</p>
                            <p>Stock: {product.product_quantity}</p>
                        </ProductCard>
                    ))}
                </ProductsGrid>

                <CartSection>
                    <h2>Cart</h2>
                    
                    {cart.map(item => (
                        <CartItem key={item.product_id}>
                            <span>{item.product_name}</span>
                            <span>Qty: {item.quantity}</span>
                            <span>${(item.quantity * item.product_sale_price).toFixed(2)}</span>
                            <RemoveButton onClick={() => handleRemoveFromCart(item.product_id)}>
                                Remove
                            </RemoveButton>
                        </CartItem>
                    ))}

                    {cart.length > 0 && (
                        <TotalSection>
                            <div>
                                <label>Tax (%):
                                    <input 
                                        type="number" 
                                        min="0" 
                                        max="100" 
                                        value={tax} 
                                        onChange={(e) => setTax(Number(e.target.value))}
                                    />
                                </label>
                                <label>Discount (%):
                                    <input 
                                        type="number" 
                                        min="0" 
                                        max="100" 
                                        value={discount} 
                                        onChange={(e) => setDiscount(Number(e.target.value))}
                                    />
                                </label>
                            </div>
                            <div>
                                <p>Subtotal: ${subtotal.toFixed(2)}</p>
                                <p>Tax Amount: ${((subtotal * tax) / 100).toFixed(2)}</p>
                                <p>Discount Amount: ${((subtotal * discount) / 100).toFixed(2)}</p>
                                <p><strong>Total: ${total.toFixed(2)}</strong></p>
                            </div>
                            <ButtonGroup>
                                <Button onClick={handleCancel} disabled={loading}>
                                    Cancel Bill
                                </Button>
                                <Button onClick={handleProceed} disabled={loading}>
                                    Complete Bill
                                </Button>
                            </ButtonGroup>
                        </TotalSection>
                    )}
                </CartSection>
            </MainContent>
        </Container>
    );
};

const Container = styled.div`
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
`;

const ErrorMessage = styled.div`
    background-color: #ff4444;
    color: white;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
`;

const InitializeSection = styled.div`
    margin-bottom: 2rem;
    text-align: center;
`;

const BillInfo = styled.div`
    background-color: #1e1e1e;
    color: #fff;
    padding: 1rem;
    border-radius: 4px;
    display: inline-block;
`;

const MainContent = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
`;

const ProductsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
`;

const ProductCard = styled.div`
    background-color: #1e1e1e;
    padding: 1rem;
    border-radius: 4px;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    opacity: ${props => props.disabled ? 0.7 : 1};
    color: #fff;
    transition: transform 0.2s;

    &:hover {
        transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    }

    h3 {
        margin: 0 0 0.5rem 0;
        color: rgb(16, 212, 25);
    }

    p {
        margin: 0.25rem 0;
        font-size: 0.9rem;
    }
`;

const CartSection = styled.div`
    background-color: #1e1e1e;
    padding: 1rem;
    border-radius: 4px;
    color: #fff;

    h2 {
        margin: 0 0 1rem 0;
        color: rgb(16, 212, 25);
    }
`;

const CartItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    border-bottom: 1px solid #333;

    h4 {
        margin: 0 0 0.25rem 0;
    }

    p {
        margin: 0.25rem 0;
        font-size: 0.9rem;
    }
`;

const RemoveButton = styled.button`
    background-color: #ff4444;
    color: white;
    border: none;
    padding: 0.5rem;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
        background-color: #cc0000;
    }
`;

const CartTotal = styled.div`
    margin: 1rem 0;
    padding: 1rem 0;
    border-top: 1px solid #333;
    font-size: 1.2rem;
    font-weight: bold;
`;

const CartActions = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 1rem;
`;

const Button = styled.button`
    background-color: ${props => props.disabled ? '#666' : 'rgb(16, 212, 25)'};
    color: ${props => props.disabled ? '#999' : '#000'};
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    font-size: 1rem;
    transition: background-color 0.2s;

    &:hover {
        background-color: ${props => props.disabled ? '#666' : '#0fa31c'};
    }
`;

const TotalSection = styled.div`
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 2px solid #ddd;

    label {
        display: block;
        margin: 0.5rem 0;
        
        input {
            margin-left: 1rem;
            width: 80px;
        }
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
`;

const CustomerSelect = styled.select`
    width: 100%;
    padding: 0.75rem;
    margin-bottom: 1rem;
    background-color: #1e1e1e;
    color: #fff;
    border: 1px solid #333;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    option {
        background-color: #1e1e1e;
        color: #fff;
    }

    &:focus {
        outline: none;
        border-color: rgb(16, 212, 25);
    }
`;

export default NewBill; 