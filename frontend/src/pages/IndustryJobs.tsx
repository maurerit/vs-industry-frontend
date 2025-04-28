import React, { useState, useEffect } from 'react';
import { useVaporSeaIndustry } from '../context/VaporSeaIndustryContext';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Typography,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';

interface IndustryJob {
  item_name: string;
  installer_name: string | null;
  job_id: number;
  blueprint_type_id: number;
  product_type_id: number;
  activity_id: number;
  licensed_runs: number;
  runs: number;
  probability: number;
  status: string;
  start_date: string;
  end_date: string;
  cost: number;
  successful_runs: number;
  installer_id: number;
}

interface IndustryJobsResponse {
  content: IndustryJob[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

const IndustryJobs: React.FC = () => {
  const {
    industryJobsPage,
    setIndustryJobsPage,
    industryJobsPageSize,
    setIndustryJobsPageSize,
    industryJobsSort,
    setIndustryJobsSort,
    industryJobsFinished,
    setIndustryJobsFinished,
  } = useVaporSeaIndustry();

  const [jobs, setJobs] = useState<IndustryJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);

  // Parse the current sort field and direction
  const [sortField, sortDirection] = industryJobsSort.split(',');

  const fetchJobs = async (page: number, size: number, sort: string, finished: boolean) => {
    try {
      setLoading(true);
      const finishedParam = finished ? '&finished=true' : '';
      const response = await fetch(`/api/corp/industry-jobs?page=${page}&size=${size}&sort=${sort}${finishedParam}`);
      if (!response.ok) {
        throw new Error('Failed to fetch industry jobs');
      }
      const data: IndustryJobsResponse = await response.json();
      setJobs(data.content);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(industryJobsPage, industryJobsPageSize, industryJobsSort, industryJobsFinished);
  }, [industryJobsPage, industryJobsPageSize, industryJobsSort, industryJobsFinished]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setIndustryJobsPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIndustryJobsPageSize(parseInt(event.target.value, 10));
    setIndustryJobsPage(0);
  };

  const handleSort = (field: string) => {
    const isAsc = sortField === field && sortDirection === 'ASC';
    setIndustryJobsSort(`${field},${isAsc ? 'DESC' : 'ASC'}`);
    setIndustryJobsPage(0);
  };

  const handleFinishedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIndustryJobsFinished(event.target.checked);
    setIndustryJobsPage(0);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatISK = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value) + ' ISK';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Industry Jobs
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={industryJobsFinished}
                onChange={handleFinishedChange}
                color="primary"
              />
            }
            label="Show Only Finished Jobs"
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={industryJobsPageSize.toString()}
              onChange={(e: SelectChangeEvent) => setIndustryJobsPageSize(Number(e.target.value))}
              displayEmpty
            >
              <MenuItem value={10}>10 per page</MenuItem>
              <MenuItem value={20}>20 per page</MenuItem>
              <MenuItem value={50}>50 per page</MenuItem>
              <MenuItem value={100}>100 per page</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'itemName'}
                  direction={sortField === 'itemName' ? sortDirection.toLowerCase() as 'asc' | 'desc' : 'asc'}
                  onClick={() => handleSort('itemName')}
                >
                  Item
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'status'}
                  direction={sortField === 'status' ? sortDirection.toLowerCase() as 'asc' | 'desc' : 'asc'}
                  onClick={() => handleSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'runs'}
                  direction={sortField === 'runs' ? sortDirection.toLowerCase() as 'asc' | 'desc' : 'asc'}
                  onClick={() => handleSort('runs')}
                >
                  Runs
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'startDate'}
                  direction={sortField === 'startDate' ? sortDirection.toLowerCase() as 'asc' | 'desc' : 'asc'}
                  onClick={() => handleSort('startDate')}
                >
                  Start Date
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'endDate'}
                  direction={sortField === 'endDate' ? sortDirection.toLowerCase() as 'asc' | 'desc' : 'asc'}
                  onClick={() => handleSort('endDate')}
                >
                  End Date
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'cost'}
                  direction={sortField === 'cost' ? sortDirection.toLowerCase() as 'asc' | 'desc' : 'asc'}
                  onClick={() => handleSort('cost')}
                >
                  Cost
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.job_id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <img 
                      src={`https://images.evetech.net/types/${job.product_type_id}/icon`} 
                      alt={job.item_name}
                      style={{ width: 32, height: 32, marginRight: 8 }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    {job.item_name}
                  </Box>
                </TableCell>
                <TableCell>{job.status}</TableCell>
                <TableCell>{job.successful_runs} / {job.runs}</TableCell>
                <TableCell>{formatDate(job.start_date)}</TableCell>
                <TableCell>{formatDate(job.end_date)}</TableCell>
                <TableCell>{formatISK(job.cost)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalElements}
        page={industryJobsPage}
        onPageChange={handleChangePage}
        rowsPerPage={industryJobsPageSize}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 20, 50, 100]}
      />
    </Box>
  );
};

export default IndustryJobs;