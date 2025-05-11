import React from "react";
import styled from "styled-components";
import NavBar from "../shared/NavBar";
import Analytics from "./Analytics";
import FAQ from "./FAQ";
import Earnings from "./Earnings";
import Transfer from "./Transfers";
import Profile from "./Profile";

const Dashboard = () => {
    return (
        <Section>
            <NavBar/>
            <div className="grid">
                <div className="row_one">
                    <Analytics/>
                    <FAQ/>
                </div>
                <div className="row_two">
                    <Earnings/>
                    <Transfer/>
                    <Profile/>
                </div>
            </div>
        </Section>
    )
}

const Section = styled.section`
    padding: 2rem;
    height: 100%;
    .grid{
        display: flex;
        flex-direction: column;
        height: 100%;
        gap: 1rem;
        margin-top: 2rem;
        .row_one{
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            height: 50%;
            gap: 1rem;
        }
        .row_two{
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            height: 50%;
            gap: 1rem;
        }
    }
`

export default Dashboard