import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Tooltip
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { BlueprintData } from '../types/blueprint';

export const Product: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<BlueprintData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/product/${id}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch product data');
        }

        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError(error instanceof Error ? error.message : 'Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography color="error">
          {error || 'Product not found'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Tooltip title="Back to Warehouse">
        <IconButton 
          onClick={() => navigate(-1)}
          sx={{ 
            mb: 2, 
            color: 'white',
            '&:hover': { 
              backgroundColor: 'rgba(255, 255, 255, 0.1)' 
            }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Tooltip>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4,
          bgcolor: 'rgba(26, 26, 26, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          {product.blueprintDetails.productTypeName}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Product ID: {product.blueprintDetails.productTypeID}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Max Production Limit: {product.blueprintDetails.maxProductionLimit}
        </Typography>
        {product.blueprintDetails.productQuantity && (
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Product Quantity: {product.blueprintDetails.productQuantity}
          </Typography>
        )}
        
        {product.activityMaterials.invention.length === 0 && (
          <>
            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
              Manufacturing Materials
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: 'white' }}>Material</TableCell>
                    <TableCell align="right" sx={{ color: 'white' }}>Quantity</TableCell>
                    <TableCell align="right" sx={{ color: 'white' }}>Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {product.activityMaterials.manufacturing.map((material) => (
                    <TableRow key={material.typeid}>
                      <TableCell sx={{ color: 'white' }}>{material.name}</TableCell>
                      <TableCell align="right" sx={{ color: 'white' }}>{material.quantity}</TableCell>
                      <TableCell align="right" sx={{ color: 'white' }}>
                        {material.price ? `${material.price.toLocaleString()} ISK` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total Cost</TableCell>
                    <TableCell />
                    <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {product.activityMaterials.manufacturing
                        .reduce((total, material) => total + (material.price || 0) * material.quantity, 0)
                        .toLocaleString()} ISK
                    </TableCell>
                  </TableRow>
                  {product.blueprintDetails.maxProductionLimit > 1 && (
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cost per Unit</TableCell>
                      <TableCell />
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>
                        {Math.round(product.activityMaterials.manufacturing
                          .reduce((total, material) => total + (material.price || 0) * material.quantity, 0) 
                          / product.blueprintDetails.maxProductionLimit)
                          .toLocaleString()} ISK
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {product.activityMaterials.invention.length > 0 && (
          <>
            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
              Invention Materials
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: 'white' }}>Material</TableCell>
                    <TableCell align="right" sx={{ color: 'white' }}>Quantity</TableCell>
                    <TableCell align="right" sx={{ color: 'white' }}>Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {product.activityMaterials.invention.map((material) => (
                    <TableRow key={material.typeid}>
                      <TableCell sx={{ color: 'white' }}>{material.name}</TableCell>
                      <TableCell align="right" sx={{ color: 'white' }}>{material.quantity}</TableCell>
                      <TableCell align="right" sx={{ color: 'white' }}>
                        {material.price ? `${material.price.toLocaleString()} ISK` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total Cost</TableCell>
                    <TableCell />
                    <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {product.activityMaterials.invention
                        .reduce((total, material) => total + (material.price || 0) * material.quantity, 0)
                        .toLocaleString()} ISK
                    </TableCell>
                  </TableRow>
                  {product.blueprintDetails.maxProductionLimit > 1 && (
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cost per Unit</TableCell>
                      <TableCell />
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>
                        {Math.round(product.activityMaterials.invention
                          .reduce((total, material) => total + (material.price || 0) * material.quantity, 0) 
                          / product.blueprintDetails.maxProductionLimit)
                          .toLocaleString()} ISK
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {product.activityMaterials.copying.length > 0 && (
          <>
            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
              Copying Materials
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: 'white' }}>Material</TableCell>
                    <TableCell align="right" sx={{ color: 'white' }}>Quantity</TableCell>
                    <TableCell align="right" sx={{ color: 'white' }}>Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {product.activityMaterials.copying.map((material) => (
                    <TableRow key={material.typeid}>
                      <TableCell sx={{ color: 'white' }}>{material.name}</TableCell>
                      <TableCell align="right" sx={{ color: 'white' }}>{material.quantity}</TableCell>
                      <TableCell align="right" sx={{ color: 'white' }}>
                        {material.price ? `${material.price.toLocaleString()} ISK` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total Cost</TableCell>
                    <TableCell />
                    <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {product.activityMaterials.copying
                        .reduce((total, material) => total + (material.price || 0) * material.quantity, 0)
                        .toLocaleString()} ISK
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Paper>
    </Box>
  );
}; 