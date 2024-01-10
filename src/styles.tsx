import styled from "styled-components";

export const Toolbar = styled.div`
  border-bottom: 2px solid ${props => props.theme.secondary};
`

export const DistributionBar = styled.div`
  background-color: ${props => props.theme.secondary};
  > p {color: ${props => props.theme.text}};
`

export const PopoverContainer = styled.div`
  border: 2px solid ${props => props.theme.secondary};
`

export const Button = styled.div`
  background-color: ${props => props.theme.primary};
  cursor: pointer;
`

export const SecondaryButton = styled.div`
  background-color: ${props => props.theme.secondary};
  cursor: pointer;
  color: ${props => props.theme.text};
`

export const InputButton = styled.input`
  background-color: ${props => props.theme.primary};
`

export const Input = styled.input`
  background-color: ${props => props.theme.primary};
`

export const PopoverContent = styled.div`
  background-color: ${props => props.theme.tertiary};
`

export const TitleTableRow = styled.tr`
  border-bottom: 2px solid ${props => props.theme.secondary};
`