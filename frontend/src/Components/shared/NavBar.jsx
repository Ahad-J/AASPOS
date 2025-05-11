import React from "react";
import styled from "styled-components";
import {BiSearch} from "react-icons/bi"
import { useLocation } from "react-router-dom";

const NavBar = () => {
    const location = useLocation();
    const hideSearch = ["/product", "/customer","/employee","/supply","/bill"].includes(location.pathname);

    return (
        <Nav>
            <div className="title">
                <h4>Hello Admin,</h4>
                <h1>Welcome to <span> POS</span></h1>
            </div>
            {!hideSearch && (
            <div className="search">
                <BiSearch/>
                <input type="text" placeholder="Search" />
            </div>
            )}
        </Nav>
    )
}

const Nav = styled.nav`
    display: flex;
    justify-content: space-between;
    color:rgb(255, 255, 255);
    .title{
        h1{
            span{
                margin-left: 0.2rem;
                color: rgb(16, 212, 25);
            }
        }
    }
    .search{
        background-color: #212121;
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 8rem 1rem 1rem;
        border-radius: 1rem;
        svg{
            color: rgb(16, 212, 25);
        }
        input{
            background-color: transparent;
            border:none;
            color: rgb(16, 212, 25);
            &::placeholder{
                color: rgb(16, 212, 25);
            }
            &:focus{
                outline: none;
            }
        }
    }
`;

export default NavBar;