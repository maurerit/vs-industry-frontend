/*
 * MIT License
 *
 * Copyright (c) 2025 VaporSea
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */


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
  Button,
} from '@mui/material';
import { formatIskAmount } from '../components/FormattingUtils';

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
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchBlueprint = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/data/blueprint/${typeId}`);
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

      // No material efficiency adjustments - use blueprint as is
      const adjustedBlueprint = { ...blueprint };

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

  // Prioritize reaction materials (activityId 11) if available, otherwise use manufacturing materials (activityId 1)
  const materials = (blueprint.activityMaterials['11'] && blueprint.activityMaterials['11'].length > 0)
    ? blueprint.activityMaterials['11']
    : blueprint.activityMaterials['1'] || [];

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
        <Typography>Adjusted Price: {formatIskAmount(blueprint.blueprintDetails.adjustedPrice)}</Typography>
      </Paper>


      {/* Materials */}
      <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Production Materials
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Material</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {materials.map((material) => (
                  <TableRow key={material.typeid}>
                    <TableCell>{material.name}</TableCell>
                    <TableCell align="right">{material.quantity}</TableCell>
                  </TableRow>
                ))}
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
