import React, { useState } from 'react';
import {
    Box, Paper, Typography, TextField, Button, Grid,
    Stepper, Step, StepLabel, CircularProgress, Alert
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import api from '../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const STEPS = ['Business Info', 'Document Upload', 'Review & Submit'];

const DOCUMENT_TYPES = [
    { label: 'Aadhaar Front', value: 'AADHAAR_FRONT' },
    { label: 'Aadhaar Back', value: 'AADHAAR_BACK' },
    { label: 'Pan Card', value: 'PAN' }, // Note: Backend enum might need update or mapping
    { label: 'Business Registration', value: 'BUSINESS_REG' }
];

export default function VendorKYC() {
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        businessName: '',
        aadhaarNumber: '',
        documents: {} // { TYPE: url }
    });

    const handleNext = () => {
        if (activeStep === 0) {
            if (!formData.businessName || !formData.aadhaarNumber) {
                return toast.error('Please fill all fields');
            }
        }
        if (activeStep === 1) {
            // Check if at least 2 docs uploaded
            if (Object.keys(formData.documents).length < 2) {
                return toast.error('Please upload at least 2 documents');
            }
        }
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => setActiveStep((prev) => prev - 1);

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        // Mock upload - in real app, upload to Cloudinary/S3
        setLoading(true);
        try {
            // Simulate upload delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock URL
            const mockUrl = `https://mock-storage.com/${file.name}`;

            setFormData(prev => ({
                ...prev,
                documents: {
                    ...prev.documents,
                    [type]: mockUrl
                }
            }));
            toast.success(`${type} uploaded!`);
        } catch (error) {
            toast.error('Upload failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Transform documents for backend
            const docsArray = Object.entries(formData.documents).map(([type, url]) => ({
                type,
                url
            }));

            await api.post('/v1/kyc/submit', {
                businessName: formData.businessName,
                aadhaarNumber: formData.aadhaarNumber,
                documents: docsArray
            });

            toast.success('KYC Submitted Successfully!');
            navigate('/vendor-dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Submission failed');
        } finally {
            setLoading(false);
        }
    };

    const getStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Business Name"
                            value={formData.businessName}
                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Aadhaar Number"
                            value={formData.aadhaarNumber}
                            onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                        />
                    </Box>
                );
            case 1:
                return (
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        {DOCUMENT_TYPES.map((doc) => (
                            <Grid item xs={12} sm={6} key={doc.value}>
                                <Paper sx={{ p: 2, textAlign: 'center', border: '1px dashed grey' }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                        {doc.label}
                                    </Typography>

                                    {formData.documents[doc.value] ? (
                                        <Typography color="success.main" variant="caption">
                                            Uploaded
                                        </Typography>
                                    ) : (
                                        <Button
                                            component="label"
                                            startIcon={<CloudUploadIcon />}
                                            size="small"
                                        >
                                            Upload
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*,.pdf"
                                                onChange={(e) => handleFileUpload(e, doc.value)}
                                            />
                                        </Button>
                                    )}
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                );
            case 2:
                return (
                    <Box sx={{ mt: 2 }}>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Please review your details before submitting.
                        </Alert>
                        <Typography><b>Business:</b> {formData.businessName}</Typography>
                        <Typography><b>Aadhaar:</b> {formData.aadhaarNumber}</Typography>
                        <Typography><b>Documents:</b> {Object.keys(formData.documents).length} uploaded</Typography>
                    </Box>
                );
            default:
                return 'Unknown step';
        }
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
                    Vendor Verification (KYC)
                </Typography>

                <Stepper activeStep={activeStep}>
                    {STEPS.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Box sx={{ mt: 4, minHeight: 200 }}>
                    {getStepContent(activeStep)}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button
                        disabled={activeStep === 0}
                        onClick={handleBack}
                    >
                        Back
                    </Button>
                    <Button
                        variant="contained"
                        onClick={activeStep === STEPS.length - 1 ? handleSubmit : handleNext}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : (activeStep === STEPS.length - 1 ? 'Submit' : 'Next')}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}
