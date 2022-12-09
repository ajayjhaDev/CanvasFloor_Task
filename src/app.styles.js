import styled from "styled-components";
import ButtonIcons from "./Vectors";

export const WorkpointIcon = styled(ButtonIcons.WorkpointIcon)``;

export const PolygonIcon = styled(ButtonIcons.PolygonIcon)``;

export const ConfirmIcon = styled(ButtonIcons.ConfirmIcon)``;

export const CenterIcon = styled(ButtonIcons.CenterIcon)``;

export const LineIcon = styled(ButtonIcons.LineIcon)``;

export const WallIcon = styled(ButtonIcons.WallIcon)``;

export const CopyIcon = styled(ButtonIcons.CopyIcon)``;

export const PasteIcon = styled(ButtonIcons.PasteIcon)``;

export const DeleteIcon = styled(ButtonIcons.DeleteIcon)``;

export const ButtonContainer = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  width: 36px;
  margin-bottom: 8px;
  background: white;
  border-radius: 4px;
  border: 1px solid gray;
  cursor: pointer;

  &:hover {
    border: 3px solid #003351;
  }
`;

export const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const ContentContainer = styled.div`
  height: 80vh;
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
`;

export const MainContainer = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const WPSizeButtonsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
`;

export const CounterButton = styled.button`
  margin: 0 4px;
  padding: 4 8px;
  border: 1px solid gray;
  cursor: pointer;
  border-radius: 4px;
  background-color: white;
`;
