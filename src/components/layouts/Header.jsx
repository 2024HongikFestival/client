import React, { useState, useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import hiuLogo from '@/assets/webps/layouts/hiuLogo.webp';
import hiuLogoBlack from '@/assets/webps/layouts/hiuLogoBlack.webp';
import hambergerMenu from '@/assets/webps/layouts/hambergerMenu.webp';
import hambergerMenuBlack from '@/assets/webps/layouts/hambergerMenuBlack.webp';
import { useNavigate, useLocation } from 'react-router-dom';
import Popup from '@/pages/admin/Popup';
import PropTypes from 'prop-types';

export default function Header() {
  const nav = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const isAdminPath = location.pathname === '/admin' || location.pathname === '/admin/event';

  const useBlackImages = (path) => {
    // 검정색 홍익로고, 검정 메뉴바 로고 들어가는 path
    const blackImagePaths = ['/admin', '/admin/event'];
    return blackImagePaths.includes(path);
  };
  const blackImages = useBlackImages(location.pathname);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsLoggedIn(false);
    nav(0);
  };

  const handleConfirmLogout = () => {
    handleLogout();
    setShowLogoutPopup(false); // 로그아웃 후 팝업 닫기
  };

  const handleCancelLogout = () => {
    setShowLogoutPopup(false); // 팝업 닫기
  };

  return (
    <>
      <HeaderLayout path={location.pathname}>
        <HeaderBg path={location.pathname}>
          <HambergerMenu onClick={toggleMenu}>
            <img src={blackImages ? hambergerMenuBlack : hambergerMenu} alt="hambergerMenu" />
          </HambergerMenu>
          <HiuLogo onClick={() => nav('/')}>
            <img src={blackImages ? hiuLogoBlack : hiuLogo} alt="hiuLogo" />
          </HiuLogo>
          <Right></Right>
        </HeaderBg>
        {isMenuOpen &&
          (isAdminPath ? (
            <AdminMenuBar
              handleCancelLogout={handleCancelLogout}
              handleConfirmLogout={handleConfirmLogout}
              showLogoutPopup={showLogoutPopup}
              setShowLogoutPopup={setShowLogoutPopup}
              nav={nav}
              closeMenu={() => setIsMenuOpen(false)}
            />
          ) : (
            <CommonMenuBar closeMenu={toggleMenu} />
          ))}
      </HeaderLayout>
    </>
  );
}

const AdminMenuBar = ({
  //어드민 페이지 메뉴바
  nav,
  handleCancelLogout,
  handleConfirmLogout,
  showLogoutPopup,
  setShowLogoutPopup,
  closeMenu,
}) => {
  const adminMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeMenu]);

  return (
    <>
      <AdminBar ref={adminMenuRef}>
        <PageMenu>
          <Menu
            onClick={() => {
              nav('/admin');
              closeMenu();
            }}
          >
            분실물 게시판 관리
          </Menu>
          <Menu
            onClick={() => {
              nav('/admin/event');
              closeMenu();
            }}
          >
            이벤트 관리
          </Menu>
        </PageMenu>
        <Logout onClick={() => setShowLogoutPopup(true)}>로그아웃</Logout>
      </AdminBar>
      {showLogoutPopup && (
        <Popup
          message="로그아웃 할까요?"
          onConfirm={handleConfirmLogout}
          onCancel={handleCancelLogout}
          confirmText="로그아웃"
          cancelText="취소"
        />
      )}
    </>
  );
};

const CommonMenuBar = () => (
  // 기본 메뉴바
  <MenuBar>
    <ul>
      <li>Common Menu 1</li>
      <li>Common Menu 2</li>
      <li>Common Menu 3</li>
    </ul>
  </MenuBar>
);

CommonMenuBar.propTypes = {
  closeMenu: PropTypes.func.isRequired, // closeMenu prop 추가
};

AdminMenuBar.propTypes = {
  nav: PropTypes.func.isRequired,
  handleCancelLogout: PropTypes.func.isRequired,
  handleConfirmLogout: PropTypes.func.isRequired,
  showLogoutPopup: PropTypes.bool.isRequired,
  setShowLogoutPopup: PropTypes.func.isRequired,
  closeMenu: PropTypes.func.isRequired,
};

const HeaderLayout = styled.div`
  width: 100%;
  max-width: 768px;
  min-width: 375px;
  margin: 0 auto;
  height: 5.6rem;
  background-color: ${(props) => props.theme.colors.black};
  position: fixed;
  top: 0rem;
  z-index: 100;

  ${(props) =>
    props.path === '/admin' &&
    css`
      background-color: ${(props) => props.theme.colors.white};
      background-size: cover;
      background-position: center;
    `}
  ${(props) =>
    props.path === '/admin/event' &&
    css`
      background-color: ${(props) => props.theme.colors.white};
      background-size: cover;
      background-position: center;
    `}
`;

const HeaderBg = styled.div`
  width: 100%;
  max-width: 768px;
  min-width: 375px;
  height: 5.6rem;
  background: rgba(22, 22, 22, 0.1);
  box-shadow: 0rem 0rem 0.4rem 0rem rgba(255, 255, 255, 0.12) inset;
  backdrop-filter: blur(0.2rem);
  position: fixed;
  top: 0rem;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;

  ${(props) =>
    props.path === '/admin' &&
    css`
      background-color: ${(props) => props.theme.colors.white};
      background-size: cover;
      background-position: center;
    `}
  ${(props) =>
    props.path === '/admin/event' &&
    css`
      background-color: ${(props) => props.theme.colors.white};
      background-size: cover;
      background-position: center;
    `}
`;

const HambergerMenu = styled.div`
  cursor: pointer;
  margin-left: 2rem;
  width: 2.4rem;
  height: 2.4rem;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
  }
`;

const HiuLogo = styled.div`
  cursor: pointer;
  width: 14.7rem;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
  }
`;

const Right = styled.div`
  margin-right: 2rem;
  width: 2.4rem;
  height: 2.4rem;
`;

const MenuBar = styled.div`
  position: absolute;
  top: 5.6rem;
  left: 0;
  width: 100%;
  height: 100vh;
  max-width: 12rem;
  background-color: white;
  z-index: 99;
`;

const AdminBar = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: absolute;
  top: 5.6rem;
  left: 0;
  width: 100%;
  height: calc(100vh - 5.6rem);
  max-width: 12rem;
  background-color: white;
  z-index: 99;
`;

const PageMenu = styled.div`
  display: flex;
  flex-direction: column;
`;

const Menu = styled.span`
  padding: 1rem;
  text-align: left;
  ${(props) => props.theme.fontStyles.basic.body1Med};
  font-size: 1rem;
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.theme.colors.gray20};
  }
`;

const Logout = styled.span`
  ${(props) => props.theme.fontStyles.basic.body1Bold};
  padding: 1rem;
  font-size: 1rem;
  text-align: center;
  color: ${(props) => props.theme.colors.white};
  background-color: ${(props) => props.theme.colors.gray70};
  cursor: pointer;
`;
