import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { adminAxiosInstance } from '@/api/axios';
import deleteBtn from '@/assets/webps/admin/deleteBtn.webp';

const formatPhoneNumber = (phoneNumber) => {
  const cleanedNumber = phoneNumber.replace(/-/g, '');
  const match = cleanedNumber.match(/^(\d{3})(\d{4})(\d{4})$/);
  if (match) {
    return `${match[1]}${match[2]}${match[3]}`;
  }

  return phoneNumber;
};

const EntryDetail = ({ prizeName, title, titleDescription, quantity }) => {
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [displayedList, setDisplayedList] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [drawnCount, setDrawnCount] = useState(0);
  const [showCancelButton, setShowCancelButton] = useState(false);

  const PAGE_SIZE = 10;

  const prizeMap = {
    에어팟: 'A',
    변신로봇: 'B',
    단검: 'C',
  };

  const getPrizeParam = (prizeName) => prizeMap[prizeName] || '';

  useEffect(() => {
    const fetchEntryDetails = async () => {
      const token = localStorage.getItem('accessToken');
      setLoading(true);
      try {
        const response = await adminAxiosInstance.get('/admin/entries', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { prize: getPrizeParam(prizeName) },
        });

        const data = response.data.data;
        const winners = data.filter((item) => item.winner);
        const nonWinners = data.filter((item) => !item.winner);
        const updatedList = [...winners, ...nonWinners];

        setList(updatedList);
        setPage(1);
        setDisplayedList(updatedList.slice(0, PAGE_SIZE));
        setHasMore(updatedList.length > PAGE_SIZE);
        setDrawnCount(winners.length);
        setShowCancelButton(winners.length > 0);
      } catch (error) {
        console.error('Error fetching entry details: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntryDetails();
  }, [prizeName]);

  useEffect(() => {
    if (page > 1) {
      const nextPageItems = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
      setDisplayedList((prev) => [...prev, ...nextPageItems]);
      setHasMore(nextPageItems.length === PAGE_SIZE);
    }
  }, [page, list]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleDraw = async (type) => {
    try {
      const token = localStorage.getItem('accessToken');
      const prizeParam = getPrizeParam(prizeName);

      const url = type === 'one' ? `/admin/draw-one?prize=${prizeParam}` : `/admin/draw?prize=${prizeParam}`;

      const response = await adminAxiosInstance.post(
        url,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Response Data:', response.data); // 응답 데이터 확인

      const data = response.data.data;
      const result = Array.isArray(data) ? data : [data];
      const updatedList = list.map((item) => {
        const drawnEntry = result.find((entry) => entry.entryId === item.entryId);
        return drawnEntry ? { ...item, winner: drawnEntry.winner } : item;
      });

      const sortedList = updatedList.sort((a, b) => {
        if (a.winner && !b.winner) return -1;
        if (!a.winner && b.winner) return 1;
        return 0;
      });

      setList(sortedList);
      setPage(1);
      setDisplayedList(sortedList.slice(0, PAGE_SIZE));
      setHasMore(sortedList.length > PAGE_SIZE);
      setDrawnCount(sortedList.filter((item) => item.winner).length);
      setShowCancelButton(sortedList.some((item) => item.winner));
    } catch (error) {
      console.error('Error drawing winners: ', error);
    }
  };

  const handleCancelWinner = async (entryId) => {
    try {
      const token = localStorage.getItem('accessToken');
      await adminAxiosInstance.delete(`/admin/entries/${entryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedList = list.map((item) => (item.entryId === entryId ? { ...item, winner: false } : item));

      const winners = updatedList.filter((item) => item.winner);
      const nonWinners = updatedList.filter((item) => !item.winner);
      const sortedList = [...winners, ...nonWinners];

      setList(sortedList);
      setPage(1);
      setDisplayedList(sortedList.slice(0, PAGE_SIZE));
      setDrawnCount(winners.length);
      setShowCancelButton(winners.length > 0);
    } catch (error) {
      console.error('Error canceling winner: ', error);
    }
  };
  const isSingleDrawEnabled = drawnCount < quantity;
  const isFullDrawEnabled = drawnCount === 0;

  const isSingleDrawComplete = drawnCount === quantity;
  const isFullDrawComplete = drawnCount === quantity;

  if (!list.length) {
    return <p style={{ padding: '2rem', textAlign: 'center' }}>응모자가 존재하지 않습니다.</p>;
  }

  return (
    <ListContainer>
      <TitleContainer>
        <Title>{`[${title}] 응모 목록`}</Title>
        <TitleDescription>{titleDescription}</TitleDescription>
      </TitleContainer>
      <Container>
        <TitleSection>
          <SubTitle>당첨</SubTitle>
          <SubTitle>이름</SubTitle>
          <SubTitle>전화번호</SubTitle>
        </TitleSection>
        {displayedList.length > 0 ? (
          displayedList.map((item, index) => (
            <List key={`${item.userId}-${index}`} $showCancelButton={showCancelButton} $isWinner={item.winner}>
              <Status $isWinner={item.winner}>{item.winner ? '당첨' : '응모'}</Status>
              <Name>{item.name}</Name>
              <Phone>{formatPhoneNumber(item.phone)}</Phone>
              {item.winner && (
                <CancelButton onClick={() => handleCancelWinner(item.entryId)} src={deleteBtn} alt="Cancel" />
              )}
            </List>
          ))
        ) : (
          <p style={{ padding: '1rem' }}>응모자가 존재하지 않습니다.</p>
        )}
        {hasMore && (
          <LoadMoreButton onClick={handleLoadMore} disabled={loading}>
            {loading ? 'Loading...' : '더보기'}
          </LoadMoreButton>
        )}
      </Container>
      <ButtonContainer>
        <ActionButton
          onClick={() => handleDraw('one')}
          $buttonType="singleDraw"
          $isEnabled={isSingleDrawEnabled}
          $isComplete={isSingleDrawComplete}
        >
          {isSingleDrawComplete ? '추첨 완료' : '1인 추가 추첨'}
        </ActionButton>

        <ActionButton
          onClick={() => handleDraw('all')}
          $buttonType="fullDraw"
          $isEnabled={isFullDrawEnabled}
          $isComplete={isFullDrawComplete}
        >
          {isFullDrawComplete ? '추첨 완료' : '전체 추첨'}
        </ActionButton>
      </ButtonContainer>
    </ListContainer>
  );
};

EntryDetail.propTypes = {
  prizeName: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  titleDescription: PropTypes.string.isRequired,
  quantity: PropTypes.number.isRequired, // Added prop types for quantity
  entryCount: PropTypes.number.isRequired, // Added prop types for entry count
};

export default EntryDetail;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  background-color: ${(props) => props.theme.colors.gray10};
  min-height: 100vh;
`;

const Container = styled.div`
  width: 32rem;
  display: flex;
  flex-direction: column;
`;

const SubTitle = styled.span`
  width: 8rem;
  color: ${(props) => props.theme.colors.white};
  ${(props) => props.theme.fontStyles.basic.body2Bold};
  font-size: 1.4rem;
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  padding: 0.8rem 0.8rem 0.8rem 1.6rem;
  background-color: ${(props) => props.theme.colors.gray80};
  box-sizing: border-box;
`;

const Status = styled.span`
  width: 8rem;
  color: ${(props) => (props.$isWinner ? '#3586D7' : props.theme.colors.gray70)};
  font-size: 1.4rem;
  ${(props) => props.theme.fontStyles.basic.body2Med};
`;

const Name = styled.span`
  width: 8rem;
  color: ${(props) => props.theme.colors.gray70};
  ${(props) => props.theme.fontStyles.basic.body2Med};
  font-size: 1.4rem;
`;

const Phone = styled.span`
  flex: 3;
  width: 12rem;
  color: ${(props) => props.theme.colors.gray70};
  ${(props) => props.theme.fontStyles.basic.body2Med};
  font-size: 1.4rem;
`;

const List = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  padding: 0.8rem 1.6rem;
  padding-right: ${(props) => (props.$showCancelButton ? '0.8rem' : '1.6rem')};
  background-color: ${(props) => (props.$isWinner ? '#C7E0F9' : props.theme.colors.white)};
  border-bottom: 0.1rem solid ${(props) => props.theme.colors.gray10};
`;

const LoadMoreButton = styled.button`
  ${(props) => props.theme.fontStyles.basic.body1Bold};
  width: 32rem;
  height: 6.4rem;
  background-color: ${(props) => props.theme.colors.white};
  color: ${(props) => props.theme.colors.gray70};
  border: none;
  font-size: 1.6rem;
  cursor: pointer;
  margin-top: 1.6rem;
  margin-bottom: 7.7rem;
`;

const Title = styled.span`
  cursor: pointer;
  ${(props) => props.theme.fontStyles.subHeadBold};
  font-size: 1.8rem;
  color: ${(props) => props.theme.colors.gray80};
  font-weight: 700;
`;

const TitleDescription = styled.span`
  margin-top: 0.4rem;
  margin-bottom: 1.6rem;
  color: ${(props) => props.theme.colors.gray40};
  ${(props) => props.theme.fontStyles.basic.captionMed};
`;
const TitleContainer = styled.div`
  display: flex;
  text-align: center;
  margin-top: 2.4rem;
  flex-direction: column;
`;

const ButtonContainer = styled.div`
  position: fixed;
  bottom: 0;
  width: 100%;
  min-width: 375px;
  max-width: 768px;
  display: flex;
  justify-content: space-between;
`;

const ActionButton = styled.button`
  width: 100%;
  height: 6.4rem;
  background-color: ${(props) => {
    if (props.$buttonType === 'singleDraw') {
      return props.$isEnabled
        ? '#89B2DB' // 활성화된 상태의 색상
        : props.theme.colors.gray50; // 비활성화된 상태의 색상
    }
    if (props.$buttonType === 'fullDraw') {
      return props.$isEnabled
        ? '#3586D7' // 활성화된 상태의 색상
        : props.theme.colors.gray60; // 비활성화된 상태의 색상
    }
    return props.theme.colors.gray60; // 기본 색상
  }};
  color: ${(props) => (props.$isEnabled ? props.theme.colors.white : props.theme.colors.gray40)};
  border: none;
  cursor: ${(props) => (props.$isEnabled ? 'pointer' : 'not-allowed')};
  font-size: 1.6rem;
  ${(props) => props.theme.fontStyles.basic.body1Bold};
`;

const CancelButton = styled.img`
  width: 2.4rem;
  height: 2.4rem;
`;
