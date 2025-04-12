import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWarehouse } from '../context/WarehouseContext';
import { BlueprintData } from '../types/blueprint';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

interface Material {
  typeid: number;
  name: string;
  quantity: number;
  maketype: string | null;
  price: number;
}

export const Product: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { prefetchedProduct, clearPrefetchedProduct } = useWarehouse();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blueprint, setBlueprint] = useState<BlueprintData | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!itemId) return;

      // Check if we have prefetched data
      if (prefetchedProduct[itemId]) {
        setBlueprint(prefetchedProduct[itemId]);
        setLoading(false);
        // Clear the prefetched data after using it
        clearPrefetchedProduct(itemId);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/product/${itemId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product data');
        }
        const data = await response.json();
        setBlueprint(data);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [itemId, prefetchedProduct, clearPrefetchedProduct]);

  const handleBack = () => {
    navigate('/warehouse');
  };

  const renderMaterialsTable = (materials: Material[], title: string) => {
    if (!materials || materials.length === 0) return null;

    const totalCost = materials.reduce(
      (sum, material) => sum + ((material.price || 0) * material.quantity),
      0
    );

    return (
      <>
        <Typography variant="h5" sx={{ mt: 4, mb: 2, color: 'white' }}>
          {title}
          {totalCost > 0 && (
            <Typography component="span" sx={{ ml: 2, color: '#4caf50' }}>
              (Total: {totalCost.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} ISK)
            </Typography>
          )}
        </Typography>
        
        <TableContainer component={Paper} sx={{ backgroundColor: '#262626' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'white' }}>Material</TableCell>
                <TableCell align="right" sx={{ color: 'white' }}>Quantity</TableCell>
                <TableCell align="right" sx={{ color: 'white' }}>Price per Unit</TableCell>
                <TableCell align="right" sx={{ color: 'white' }}>Total Cost</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materials.map((material) => (
                <TableRow key={material.typeid}>
                  <TableCell sx={{ color: 'white' }}>{material.name}</TableCell>
                  <TableCell align="right" sx={{ color: 'white' }}>
                    {material.quantity.toLocaleString()}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'white' }}>
                    {material.price ? 
                      `${material.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })} ISK` : 
                      'N/A'
                    }
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'white' }}>
                    {material.price ? 
                      `${(material.price * material.quantity).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })} ISK` : 
                      'N/A'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ color: 'error.main', p: 2 }}>
        Error: {error}
      </Box>
    );
  }

  if (!blueprint) {
    return (
      <Box sx={{ color: 'warning.main', p: 2 }}>
        Blueprint not found
      </Box>
    );
  }

  const totalManufacturingCost = blueprint.activityMaterials.manufacturing.reduce(
    (sum, material) => sum + ((material.price || 0) * material.quantity),
    0
  );

  const totalInventionCost = blueprint.activityMaterials.invention.reduce(
    (sum, material) => sum + ((material.price || 0) * material.quantity),
    0
  );

  const pricePerUnit = blueprint.blueprintDetails.maxProductionLimit > 1 ? 
    (totalManufacturingCost || totalInventionCost) / blueprint.blueprintDetails.maxProductionLimit : 
    null;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Tooltip title="Back to Warehouse">
          <IconButton 
            onClick={handleBack}
            sx={{ 
              mr: 2,
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)'
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h4" sx={{ color: 'white' }}>
          {blueprint.blueprintDetails.productTypeName}
        </Typography>
      </Box>

      <Paper sx={{ p: 3, backgroundColor: '#1a1a1a', color: 'white' }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          {blueprint.blueprintDetails.productTypeName}
        </Typography>
        
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          <Paper sx={{ p: 2, backgroundColor: '#262626' }}>
            <Typography variant="subtitle1" sx={{ color: 'white' }}>
              Max Production Limit
            </Typography>
            <Typography variant="h5" sx={{ color: 'white' }}>
              {blueprint.blueprintDetails.maxProductionLimit.toLocaleString()}
            </Typography>
          </Paper>

          {totalManufacturingCost > 0 && (
            <Paper sx={{ p: 2, backgroundColor: '#262626' }}>
              <Typography variant="subtitle1" sx={{ color: 'white' }}>
                Total Material Cost
              </Typography>
              <Typography variant="h5" sx={{ color: 'white' }}>
                {totalManufacturingCost.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })} ISK
              </Typography>
            </Paper>
          )}

          {pricePerUnit && (
            <Paper sx={{ p: 2, backgroundColor: '#262626' }}>
              <Typography variant="subtitle1" sx={{ color: 'white' }}>
                Price Per Unit
              </Typography>
              <Typography variant="h5" sx={{ color: 'white' }}>
                {pricePerUnit.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })} ISK
              </Typography>
            </Paper>
          )}
        </Box>

        {renderMaterialsTable(blueprint.activityMaterials.manufacturing, 'Manufacturing Materials')}
        {renderMaterialsTable(blueprint.activityMaterials.invention, 'Invention Materials')}
        {renderMaterialsTable(blueprint.activityMaterials.copying, 'Copying Materials')}
      </Paper>
    </Box>
  );
}; 