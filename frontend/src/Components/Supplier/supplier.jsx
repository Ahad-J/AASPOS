import React from "react";
import styled from "styled-components";
import NavBar from "../shared/NavBar";
import Suppliers from "./suppliers";

const Supplier = () => {
    return (
        <Section>
            <NavBar/>
            <Suppliers/>
        </Section>
    )
}

const Section = styled.section`
    padding: 2rem;
    height: 100%;
`

export default Supplier