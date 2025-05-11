import React, { useState, useEffect } from "react";
import styled from 'styled-components';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdSpaceDashboard } from "react-icons/md";
import { FaAddressCard, FaTaxi } from "react-icons/fa";
import { FaPeopleRoof } from "react-icons/fa6";
import { IoMdPeople } from "react-icons/io";
import { IoSettings } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi";
import { FaMoneyBills } from "react-icons/fa6";
import { MdOutlineProductionQuantityLimits } from "react-icons/md";
import logo from '../assets/logo.png';
const SideBar = () => {
    const [currentLink, setCurrentLink] = useState(0); // Default to 0 (no link active initially)
    const location = useLocation();
    const navigate = useNavigate();

    // Update currentLink based on the current route
    useEffect(() => {
        switch (location.pathname) {
            case "/dashboard":
                setCurrentLink(1);
                break;
            case "/product":
                setCurrentLink(2);
                break;
            case "/customer":
                setCurrentLink(3);
                break;
            case "/employee":
                setCurrentLink(4);
                break;
            case "/supply":
                setCurrentLink(5);
                break;
            case "/bill":
                setCurrentLink(6);
                break;
            default:
                setCurrentLink(0); // No active link if route doesn't match
        }
    }, [location.pathname]);

    const handleLogout = () => {
        // Clear any stored authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Clear any other stored data if needed
        sessionStorage.clear();
        
        // Redirect to login page
        navigate('/');
    };

    return (
        <>
            <Section>
                <div className="top">
                    <div className="brand">
                        <img src={logo} alt="Logo" />
                        <span>AASPOS</span>
                    </div>
                    <div className="toggle"></div>
                    <div className="links">
                        <ul>
                            <li onClick={() => setCurrentLink(1)} className={currentLink === 1 ? "active" : ""}>
                                <Link to="/dashboard">
                                    <MdSpaceDashboard />
                                    <span> DashBoard</span>
                                </Link>
                            </li>
                            <li onClick={() => setCurrentLink(2)} className={currentLink === 2 ? "active" : ""}>
                                <Link to="/product">
                                    <MdOutlineProductionQuantityLimits />
                                    <span> Products</span>
                                </Link>
                            </li>
                            <li onClick={() => setCurrentLink(3)} className={currentLink === 3 ? "active" : ""}>
                                <Link to="/customer">
                                    <FaAddressCard />
                                    <span> Customers</span>
                                </Link>
                            </li>
                            <li onClick={() => setCurrentLink(4)} className={currentLink === 4 ? "active" : ""}>
                                <Link to="/employee">
                                    <FaPeopleRoof />
                                    <span> Employees</span>
                                </Link>
                            </li>
                            <li onClick={() => setCurrentLink(5)} className={currentLink === 5 ? "active" : ""}>
                                <Link to="/supply">
                                    <IoMdPeople />
                                    <span> Suppliers</span>
                                </Link>
                            </li>
                            <li onClick={() => setCurrentLink(6)} className={currentLink === 6 ? "active" : ""}>
                                <Link to="/bill">
                                    <FaMoneyBills />
                                    <span> Billings</span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="logout">
                    <button onClick={handleLogout}>
                        <FiLogOut />
                        <span className="logout"> Logout</span>
                    </button>
                </div>
            </Section>
        </>
    );
};

const Section = styled.section`
    position: fixed;
    left: 0;
    background-color: #212121;
    height: 100vh;
    width: 18vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 2rem 0;
    gap: 2rem;
    border-radius: 0 20px 20px 0;
    box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);

    .top {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      width: 100%;

      .toggle {
        display: none;
      }

      .brand {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 2rem;

        img {
          width: 2rem;
          height: 2rem;
          object-fit: contain;
        }

        span {
          color: rgb(255, 255, 255);
          font-size: 2rem;
        }
      }

      .links {
        display: flex;
        justify-content: center;
        width: 100%;

        ul {
          list-style-type: none;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
          padding: 0 1rem;

          li {
            padding: 0.6rem 1rem;
            border-radius: 0.6rem;
            transition: background-color 0.3s ease, color 0.3s ease;

            a {
              text-decoration: none;
              display: flex;
              gap: 1rem;
              align-items: center;
              color: rgb(255, 255, 255);
              transition: color 0.3s ease;
            }
          }

          li:hover {
            background-color: rgb(16, 212, 25);

            a {
              color: rgb(0, 0, 0);
            }
          }

          .active {
            background-color: rgb(16, 212, 25);

            a {
              color: rgb(0, 0, 0);
            }
          }
        }
      }
    }

    .logout {
        padding: 0.3rem 1rem;
        border-radius: 0.6rem;
        width: 100%;
        display: flex;
        justify-content: center;
        
        button {
            background: none;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 1rem;
            color: rgb(255, 255, 255);
            padding: 0.5rem 1rem;
            border-radius: 0.6rem;
            transition: background-color 0.3s ease;
            
            &:hover {
                background-color: #da0037;
            }
        }
    }
`;

export default SideBar;