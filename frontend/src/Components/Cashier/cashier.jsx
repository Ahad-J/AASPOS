import React from "react";
import styled from "styled-components";
import NavBar from "../shared/NavBar";
import Cashier from "./cashiers";

const Product = () => {
    return (
        <Section>
            <NavBar/>
            <Cashier/>
        </Section>
    )
}

const Section = styled.section`
    padding: 2rem;
    height: 100%;
`

export default Product