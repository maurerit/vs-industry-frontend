import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Slider,
  Button,
} from '@mui/material';

interface Skill {
  typeid: number;
  name: string;
  level: number;
}

interface Material {
  typeid: number;
  name: string;
  quantity: number;
  maketype?: number;
}

interface Decryptor {
  name: string;
  typeid: number;
  multiplier: number;
  me: number;
  te: number;
  runs: number;
}

interface BlueprintData {
  requestedid: number;
  blueprintSkills: {
    [key: string]: Skill[];
  };
  blueprintDetails: {
    maxProductionLimit: number;
    productTypeID: number;
    productTypeName: string;
    productQuantity: number;
    times: {
      [key: string]: number;
    };
    facilities: string[];
    techLevel: number;
    adjustedPrice: number;
    precursorAdjustedPrice: number;
    precursorTypeId: number;
    probability: number;
  };
  activityMaterials: {
    [key: string]: Material[];
  };
  decryptors: Decryptor[];
}

const ConfigureProduct: React.FC = () => {
  const { typeId } = useParams<{ typeId: string }>();
  const navigate = useNavigate();
  const [blueprint, setBlueprint] = useState<BlueprintData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meLevel, setMeLevel] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchBlueprint = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/js-api/blueprint/blueprint/api/blueprint.php?typeid=${typeId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch blueprint data');
        }
        const data = await response.json();
        setBlueprint(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (typeId) {
      fetchBlueprint();
    }
  }, [typeId]);

  const handleSubmit = async () => {
    if (!blueprint) return;

    try {
      setSubmitting(true);
      setError(null);

      // Create adjusted blueprint data
      const adjustedBlueprint = {
        ...blueprint,
        activityMaterials: {
          ...blueprint.activityMaterials,
          '1': blueprint.activityMaterials['1'].map(material => {
            const materialReductionFactor = 1 - (meLevel * 0.01);
            const adjustedQuantity = Math.ceil(material.quantity * materialReductionFactor);
            return {
              ...material,
              quantity: adjustedQuantity
            };
          })
        }
      };

      const response = await fetch('/api/product-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adjustedBlueprint),
      });

      if (!response.ok) {
        throw new Error('Failed to save product setup');
      }

      // Navigate back to products page on success
      navigate('/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product setup');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!blueprint) {
    return null;
  }

  const manufacturingMaterials = blueprint.activityMaterials['1'] || [];

  return (
    <Box sx={{ 
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
      gap: 3,
      p: 3
    }}>
      {/* Basic Information */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Basic Information
        </Typography>
        <Typography>Tech Level: {blueprint.blueprintDetails.techLevel}</Typography>
        <Typography>Max Production Limit: {blueprint.blueprintDetails.maxProductionLimit}</Typography>
        <Typography>Product Quantity: {blueprint.blueprintDetails.productQuantity}</Typography>
        <Typography>Adjusted Price: {blueprint.blueprintDetails.adjustedPrice.toLocaleString()} ISK</Typography>
      </Paper>

      {/* ME Level Slider */}
      <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Material Efficiency Level
          </Typography>
          <Slider
            value={meLevel}
            onChange={(_, value) => setMeLevel(value as number)}
            min={0}
            max={10}
            step={1}
            marks
            valueLabelDisplay="auto"
          />
        </Paper>
      </Box>

      {/* Manufacturing Materials */}
      <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Manufacturing Materials
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Material</TableCell>
                  <TableCell align="right">Base Quantity</TableCell>
                  <TableCell align="right">Adjusted Quantity (ME {meLevel})</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {manufacturingMaterials.map((material) => {
                  const materialReductionFactor = 1 - (meLevel * 0.01);
                  const adjustedQuantity = Math.ceil(material.quantity * materialReductionFactor);
                  
                  return (
                    <TableRow key={material.typeid}>
                      <TableCell>{material.name}</TableCell>
                      <TableCell align="right">{material.quantity}</TableCell>
                      <TableCell align="right">{adjustedQuantity}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* Submit Button */}
      <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' }, display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? 'Saving...' : 'Save Product Setup'}
        </Button>
      </Box>

      {error && (
        <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' }, color: 'error.main', mt: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default ConfigureProduct; 