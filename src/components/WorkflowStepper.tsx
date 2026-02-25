/**
 * @fileoverview 공통 워크플로우 스텝바
 * @description 5단계 분석 플로우의 현재 진행 상태를 표시
 */
import React from 'react';
import { Box, Stepper, Step, StepLabel, StepConnector, stepConnectorClasses, styled } from '@mui/material';
import { CloudUpload, FactCheck, Rule, CompareArrows, Assessment } from '@mui/icons-material';

const steps = [
  { label: '파싱', icon: <CloudUpload /> },
  { label: '검증', icon: <FactCheck /> },
  { label: '분석', icon: <Rule /> },
  { label: '비교', icon: <CompareArrows /> },
  { label: '리포트', icon: <Assessment /> },
];

const NavyConnector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 20 },
  [`&.${stepConnectorClasses.active}`]: { [`& .${stepConnectorClasses.line}`]: { background: '#003875' } },
  [`&.${stepConnectorClasses.completed}`]: { [`& .${stepConnectorClasses.line}`]: { background: '#003875' } },
  [`& .${stepConnectorClasses.line}`]: { height: 3, border: 0, backgroundColor: '#e0e0e0', borderRadius: 1 },
}));

const StepIconRoot = styled('div')<{ ownerState: { completed?: boolean; active?: boolean } }>(
  ({ ownerState }) => ({
    backgroundColor: ownerState.completed || ownerState.active ? '#003875' : '#e0e0e0',
    color: '#fff',
    width: 42,
    height: 42,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: ownerState.active ? '0 2px 10px rgba(0,56,117,0.4)' : 'none',
    transition: 'all 0.3s',
    '& svg': { fontSize: 20 },
  }),
);

function CustomStepIcon(props: { active?: boolean; completed?: boolean; icon: React.ReactNode; className?: string }) {
  const { active, completed, icon } = props;
  const idx = Number(icon) - 1;
  return (
    <StepIconRoot ownerState={{ completed, active }} className={props.className}>
      {steps[idx]?.icon}
    </StepIconRoot>
  );
}

interface WorkflowStepperProps {
  activeStep: number; // 0-based
}

const WorkflowStepper: React.FC<WorkflowStepperProps> = ({ activeStep }) => (
  <Box sx={{ mb: 3 }}>
    <Stepper alternativeLabel activeStep={activeStep} connector={<NavyConnector />}>
      {steps.map((s) => (
        <Step key={s.label}>
          <StepLabel StepIconComponent={CustomStepIcon}
            sx={{ '& .MuiStepLabel-label': { mt: 1, fontSize: 12, fontWeight: 600 } }}>
            {s.label}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  </Box>
);

export default WorkflowStepper;
