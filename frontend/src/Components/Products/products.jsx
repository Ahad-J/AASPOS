import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { FaTrash, FaCheckCircle, FaSearch, FaPlus } from "react-icons/fa";
import axios from '../../utils/axios';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('active');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('name');
    const [newProduct, setNewProduct] = useState({
        product_name: '',
        product_type: '',
        product_description: '',
        product_cost_price: '',
        product_sale_price: '',
        product_quantity: '',
        product_supplier: '',
        min_stock: '',
        max_stock: ''
    });
    const [suppliers, setSuppliers] = useState([]);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('/api/manager/view-inventory');
                console.log('Products response:', response.data);
                setProducts(response.data.data || []);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching products:", error);
                setError(error.response?.data?.error || 'Failed to fetch products');
                setLoading(false);
            }
        };
        fetchProducts();
    }, [submitSuccess]); // Refresh when a new product is added successfully

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const response = await axios.get('/api/manager/view-suppliers');
                setSuppliers(response.data || []);
            } catch (error) {
                console.error("Error fetching suppliers:", error);
            }
        };
        fetchSuppliers();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError(null);
        setSubmitSuccess(false);

        try {
            const response = await axios.post('/api/manager/add-product', newProduct);
            setSubmitSuccess(true);
            setNewProduct({
                product_name: '',
                product_type: '',
                product_description: '',
                product_cost_price: '',
                product_sale_price: '',
                product_quantity: '',
                product_supplier: '',
                min_stock: '',
                max_stock: ''
            });
            // Show success message
            alert('Product added successfully!');
        } catch (error) {
            setSubmitError(error.response?.data?.error || 'Failed to add product');
        }
    };

    const toggleProductAvailability = async (productId, newAvailability) => {
        try {
            await axios.patch(`/api/manager/product/${productId}/availability`, {
                available: newAvailability
            });
            
            setProducts(products.map(product => 
                product.id === productId 
                    ? { ...product, available: newAvailability }
                    : product
            ));
        } catch (error) {
            console.error("Error updating product availability:", error);
            alert('Failed to update product. Please try again.');
        }
    };

    const filterProducts = (productList) => {
        if (!searchTerm) return productList;
        
        const term = searchTerm.toLowerCase();
        return productList.filter(product => {
            switch (searchCategory) {
                case 'name':
                    return product.name?.toLowerCase().includes(term);
                case 'type':
                    return product.type?.toLowerCase().includes(term);
                case 'id':
                    return product.id?.toLowerCase().includes(term);
                default:
                    return true;
            }
        });
    };

    if (loading) return <div>Loading products...</div>;
    if (error) return <div>Error: {error}</div>;

    const activeProducts = products.filter(product => product.available);
    const inactiveProducts = products.filter(product => !product.available);
    const filteredProducts = filterProducts(
        activeTab === 'active' ? activeProducts : inactiveProducts
    );

    return (
        <Section>
            <Header>
                <h2>Products</h2>
                {activeTab !== 'add' && (
                    <SearchContainer>
                        <SearchWrapper>
                            <SearchInput
                                type="text"
                                placeholder={`Search by ${searchCategory}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <SearchIcon>
                                <FaSearch />
                            </SearchIcon>
                        </SearchWrapper>
                        <SearchSelect
                            value={searchCategory}
                            onChange={(e) => setSearchCategory(e.target.value)}
                        >
                            <option value="name">Name</option>
                            <option value="type">Type</option>
                            <option value="id">ID</option>
                        </SearchSelect>
                    </SearchContainer>
                )}
                <TabContainer>
                    <Tab 
                        active={activeTab === 'active'} 
                        onClick={() => setActiveTab('active')}
                    >
                        Active Products ({activeProducts.length})
                    </Tab>
                    <Tab 
                        active={activeTab === 'inactive'} 
                        onClick={() => setActiveTab('inactive')}
                    >
                        Inactive Products ({inactiveProducts.length})
                    </Tab>
                    <Tab 
                        active={activeTab === 'add'} 
                        onClick={() => setActiveTab('add')}
                    >
                        <FaPlus /> Add Product
                    </Tab>
                </TabContainer>
            </Header>
            
            {activeTab === 'add' ? (
                <AddProductForm onSubmit={handleSubmit}>
                    {submitError && <ErrorMessage>{submitError}</ErrorMessage>}
                    {submitSuccess && <SuccessMessage>Product added successfully!</SuccessMessage>}
                    
                    <FormGroup>
                        <Label>Product Name *</Label>
                        <Input
                            type="text"
                            name="product_name"
                            value={newProduct.product_name}
                            onChange={handleInputChange}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Product Type *</Label>
                        <Input
                            type="text"
                            name="product_type"
                            value={newProduct.product_type}
                            onChange={handleInputChange}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Description</Label>
                        <TextArea
                            name="product_description"
                            value={newProduct.product_description}
                            onChange={handleInputChange}
                        />
                    </FormGroup>

                    <FormRow>
                        <FormGroup>
                            <Label>Cost Price *</Label>
                            <Input
                                type="number"
                                name="product_cost_price"
                                value={newProduct.product_cost_price}
                                onChange={handleInputChange}
                                required
                                min="0"
                                step="0.01"
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>Sale Price *</Label>
                            <Input
                                type="number"
                                name="product_sale_price"
                                value={newProduct.product_sale_price}
                                onChange={handleInputChange}
                                required
                                min="0"
                                step="0.01"
                            />
                        </FormGroup>
                    </FormRow>

                    <FormRow>
                        <FormGroup>
                            <Label>Initial Quantity</Label>
                            <Input
                                type="number"
                                name="product_quantity"
                                value={newProduct.product_quantity}
                                onChange={handleInputChange}
                                min="0"
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>Supplier</Label>
                            <Select
                                name="product_supplier"
                                value={newProduct.product_supplier}
                                onChange={handleInputChange}
                            >
                                <option value="">Select Supplier</option>
                                {suppliers.map(supplier => (
                                    <option key={supplier.supplier_id} value={supplier.supplier_id}>
                                        {supplier.supplier_name}
                                    </option>
                                ))}
                            </Select>
                        </FormGroup>
                    </FormRow>

                    <FormRow>
                        <FormGroup>
                            <Label>Minimum Stock</Label>
                            <Input
                                type="number"
                                name="min_stock"
                                value={newProduct.min_stock}
                                onChange={handleInputChange}
                                min="0"
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>Maximum Stock</Label>
                            <Input
                                type="number"
                                name="max_stock"
                                value={newProduct.max_stock}
                                onChange={handleInputChange}
                                min="0"
                            />
                        </FormGroup>
                    </FormRow>

                    <SubmitButton type="submit">Add Product</SubmitButton>
                </AddProductForm>
            ) : (
                <div className="grid">
                    {filteredProducts.map((product) => (
                        <div className="card" key={product.id}>
                            <ProductHeader>
                                <h3>{product.name}</h3>
                                {activeTab === 'active' ? (
                                    <DeleteButton 
                                        onClick={() => toggleProductAvailability(product.id, false)}
                                        title="Disable Product"
                                    >
                                    <FaTrash />
                                </DeleteButton>
                                ) : (
                                    <EnableButton 
                                        onClick={() => toggleProductAvailability(product.id, true)}
                                        title="Enable Product"
                                    >
                                        <FaCheckCircle />
                                    </EnableButton>
                                )}
                            </ProductHeader>
                            <div className="product-details">
                                <DetailRow>
                                    <Label>ID:</Label>
                                    <Value>{product.id}</Value>
                                </DetailRow>
                                <DetailRow>
                                    <Label>Type:</Label>
                                    <Value>{product.type}</Value>
                                </DetailRow>
                                <DetailRow>
                                    <Label>Quantity:</Label>
                                    <Value>{product.quantity}</Value>
                                </DetailRow>
                                <DetailRow>
                                    <Label>Price:</Label>
                                    <Value>PKR {product.price?.toLocaleString() || '0'}</Value>
                                </DetailRow>
                                <Description>{product.description}</Description>
                            </div>
                        </div>
                    ))}
                    {filteredProducts.length === 0 && (
                        <div className="no-data">
                            {searchTerm 
                                ? `No ${activeTab} products found matching your search`
                                : `No ${activeTab} products available`}
                        </div>
                    )}
                </div>
            )}
        </Section>
    );
};

const Section = styled.section`
    padding: 2rem;
    h2 {
        margin-bottom: 1rem;
        color: rgb(16, 212, 25);
    }
    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
    }
    .card {
        background-color: white;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
        transition: transform 0.3s ease;

        &:hover {
            transform: translateY(-5px);
        }
    }
    .no-data {
        text-align: center;
        color: #777;
        padding: 1rem;
        grid-column: 1 / -1;
    }
`;

const Header = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
`;

const TabContainer = styled.div`
    display: flex;
    gap: 1rem;
    border-bottom: 2px solid #eee;
`;

const Tab = styled.button`
    padding: 0.5rem 1rem;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 1rem;
    color: ${props => props.active ? 'rgb(16, 212, 25)' : '#666'};
    border-bottom: 2px solid ${props => props.active ? 'rgb(16, 212, 25)' : 'transparent'};
    margin-bottom: -2px;
    transition: all 0.3s ease;

    &:hover {
        color: rgb(16, 212, 25);
    }
`;

const DetailRow = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid #eee;
`;

const Label = styled.span`
    color: #666;
    font-weight: 500;
`;

const Value = styled.span`
    color: #333;
    font-weight: 600;
`;

const Description = styled.p`
    margin-top: 1rem;
    color: #666;
    font-size: 0.9rem;
    line-height: 1.4;
`;

const DeleteButton = styled.button`
    background: none;
    border: none;
    color: #dc3545;
    cursor: pointer;
    padding: 0.5rem;
    transition: color 0.3s ease;

    &:hover {
        color: #c82333;
    }
`;

const EnableButton = styled(DeleteButton)`
    color: rgb(16, 212, 25);
    
    &:hover {
        color: #0d8d19;
    }
`;

const ProductHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    
    h3 {
        margin: 0;
        color: rgb(16, 212, 25);
    }
`;

const SearchContainer = styled.div`
    display: flex;
    gap: 1rem;
    margin: 1rem 0 2rem;
    width: 100%;
    max-width: 800px;
    background: #212121;
    padding: 1rem;
    border-radius: 1rem;
    align-items: center;
`;

const SearchWrapper = styled.div`
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 0.75rem 1rem;
    padding-left: 2.5rem;
    background: transparent;
    border: none;
    color: rgb(16, 212, 25);
    font-size: 1rem;
    
    &::placeholder {
        color: rgba(16, 212, 25, 0.7);
    }

    &:focus {
        outline: none;
    }
`;

const SearchIcon = styled.div`
    position: absolute;
    left: 0.75rem;
    color: rgb(16, 212, 25);
    font-size: 1.2rem;
    display: flex;
    align-items: center;
`;

const SearchSelect = styled.select`
    padding: 0.75rem 1rem;
    border: none;
    background: transparent;
    color: rgb(16, 212, 25);
    font-size: 1rem;
    cursor: pointer;
    min-width: 120px;
    
    option {
        background: #212121;
        color: rgb(16, 212, 25);
    }

    &:focus {
        outline: none;
    }
`;

const AddProductForm = styled.form`
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    max-width: 800px;
    margin: 0 auto;
`;

const FormGroup = styled.div`
    margin-bottom: 1.5rem;
`;

const FormRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
`;

const Input = styled.input`
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    
    &:focus {
        outline: none;
        border-color: rgb(16, 212, 25);
    }
`;

const TextArea = styled.textarea`
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    min-height: 100px;
    resize: vertical;
    
    &:focus {
        outline: none;
        border-color: rgb(16, 212, 25);
    }
`;

const Select = styled.select`
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    background: white;
    
    &:focus {
        outline: none;
        border-color: rgb(16, 212, 25);
    }
`;

const SubmitButton = styled.button`
    background: rgb(16, 212, 25);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    width: 100%;
    
    &:hover {
        background: #0d8d19;
    }
`;

const ErrorMessage = styled.div`
    background: #ffebee;
    color: #c62828;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
`;

const SuccessMessage = styled.div`
    background: #e8f5e9;
    color: #2e7d32;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
`;

export default Products;