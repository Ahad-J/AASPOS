import React from "react";
import styled from "styled-components";
import NavBar from "../shared/NavBar";
import Customers from "./customers";

const Customer = () => {
    return (
        <Section>
            <NavBar/>
            <Customers/>
        </Section>
    )
}

const Section = styled.section`
    padding: 2rem;
    height: 100%;
`

export default Customer