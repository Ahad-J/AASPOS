import React from "react";
import styled from "styled-components";
import NavBar from "../shared/NavBar";
import Employees from "./employees";

const Employee = () => {
    return (
        <Section>
            <NavBar/>
            <Employees/>
        </Section>
    )
}

const Section = styled.section`
    padding: 2rem;
    height: 100%;
`

export default Employee