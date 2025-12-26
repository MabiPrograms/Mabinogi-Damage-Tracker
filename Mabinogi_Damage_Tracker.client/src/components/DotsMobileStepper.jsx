import { useTheme } from '@mui/material/styles';
import { Button, MobileStepper } from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material' 

export default function DotsMobileStepper({ steps, activeStep, setActiveStep }) {
    const theme = useTheme();

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    return (
        <MobileStepper
            steps={steps}
            position="static"
            activeStep={activeStep}
            sx={{ maxWidth: 400, flexGrow: 1, background: theme.palette.background.paper, }}
            nextButton={
                <Button size="small" onClick={handleNext} disabled={activeStep === steps - 1} color="cardAccent">
                    Next
                    {theme.direction === 'rtl' ? (
                        <KeyboardArrowLeft color="cardAccent" />
                    ) : (
                        <KeyboardArrowRight color="cardAccent" />
                    )}
                </Button>
            }
            backButton={
                <Button size="small" onClick={handleBack} disabled={activeStep === 0} color="cardAccent">
                    {theme.direction === 'rtl' ? (
                        <KeyboardArrowRight color="cardAccent" />
                    ) : (
                        <KeyboardArrowLeft color="cardAccent" />
                    )}
                    Back
                </Button>
            }
        />
    );
}