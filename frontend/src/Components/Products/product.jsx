import React from "react";
import styled from "styled-components";
import NavBar from "../shared/NavBar";
import Products from "./products";

const Product = () => {
    return (
        <Section>
            <NavBar/>
            <Products/>
        </Section>
    )
}

const Section = styled.section`
    padding: 2rem;
    height: 100%;
`

export default Product