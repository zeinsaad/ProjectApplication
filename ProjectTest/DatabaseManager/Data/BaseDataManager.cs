using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectTest.DatabaseManager.Data
{
	public class BaseDataManager
	{
		protected static readonly string connectionString = "Server=ZEIN\\ZEIN;Database=ProjectTest;User Id=zein;Password=zeinsd12;";

		public BaseDataManager()
		{
		}

		public int ExecuteNonQuery(string sp, params SqlParameter[] param)
		{
			using (var connection = new SqlConnection(connectionString))
			{
				connection.Open();
				using (var command = new SqlCommand(sp, connection))
				{
					command.CommandType = CommandType.StoredProcedure;
					command.Parameters.AddRange(param);

					return command.ExecuteNonQuery();
				}
			}
		}

		public List<T> GetSPItems<T>(string storedProcedureName,
									 Func<IDataReader, T> mapper,
			                         params object[] parameters)
		{
			var items = new List<T>();

			using (SqlConnection connection = new SqlConnection(connectionString))
			{
				connection.Open();
				using (SqlCommand command = new SqlCommand(storedProcedureName, connection))
				{
					command.CommandType = CommandType.StoredProcedure;

					SqlCommandBuilder.DeriveParameters(command);


					for (int i = 0; i < parameters.Length; i++)
					{
						var param = command.Parameters[i + 1];
						param.Value = parameters[i] ?? DBNull.Value;

					}

					using (SqlDataReader reader = command.ExecuteReader())
					{
						while (reader.Read())
						{
							items.Add(mapper(reader));
						}


					}
				}
			}

			return items;
		}



	}
}
