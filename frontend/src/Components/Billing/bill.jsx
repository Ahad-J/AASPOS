import React, { useState } from "react";
import styled from "styled-components";
import NavBar from "../shared/NavBar";
import Bills from "./bills";
import NewBill from "./NewBill";

const Bill = () => {
    const [activeTab, setActiveTab] = useState('new'); // 'new' or 'history'

    return (
        <Section>
            <NavBar/>
            <TabContainer>
                <Tab 
                    $isActive={activeTab === 'new'} 
                    onClick={() => setActiveTab('new')}
                >
                    New Bill
                </Tab>
                <Tab 
                    $isActive={activeTab === 'history'} 
                    onClick={() => setActiveTab('history')}
                >
                    Bill History
                </Tab>
            </TabContainer>
            {activeTab === 'new' ? <NewBill /> : <Bills />}
        </Section>
    )
}

const Section = styled.section`
    padding: 2rem;
    height: 100%;
    background-color: #121212;
`;

const TabContainer = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
`;

const Tab = styled.button`
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    background: ${props => props.$isActive ? 'rgb(16, 212, 25)' : '#1e1e1e'};
    color: ${props => props.$isActive ? '#000' : '#fff'};
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1rem;

    &:hover {
        background: ${props => props.$isActive ? 'rgb(16, 212, 25)' : '#333'};
    }
`;

export default Bill;